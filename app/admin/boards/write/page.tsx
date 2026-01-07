'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useDropzone } from 'react-dropzone';
import { useCreateAdminBoard, useUpdateAdminBoard, useAdminBoardDetail } from '@/app/admin/hooks/boardHooks';
import { useCreateAdminNotification } from '@/app/admin/hooks/notificationHooks';
import { BoardType, BoardAttachment, BoardResponse } from '@/types/boardTypes';
import { BOARD_TYPE_LABELS, BOARD_TYPE_OPTIONS } from '@/constants/boardConstants';

interface UploadedImage {
    id: string;
    name: string;
    size: number;
    src: string;
    file: File;
    inserted: boolean;
}

type EditableAttachment = BoardAttachment & { isVirtual?: boolean };

type RawAttachment = Partial<BoardAttachment> & Record<string, unknown>;

const ATTACHMENT_KEYS = ['attachments', 'attachmentResponses', 'attachmentList', 'attachmentsResponse', 'attachmentFiles'];
const MAX_ATTACHMENT_COUNT = 3;
const MAX_SINGLE_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 30 * 1024 * 1024;

const decodeHtmlContent = (value: string): string => {
    if (!value) {
        return value;
    }
    if (typeof window === 'undefined') {
        return value;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, 'text/html');
    return doc.body.innerHTML;
};

const createAttachmentImageHtml = (attachment: BoardAttachment): string => {
    const alt = attachment.originalName ? attachment.originalName.replace(/"/g, '&quot;') : '';
    return `<p data-attachment-no="${attachment.attachmentNo}"><img class="tiptap-image" src="${attachment.storedPath}" alt="${alt}" data-attachment-no="${attachment.attachmentNo}" /></p>`;
};

const appendMissingAttachmentsToContent = (baseContent: string, attachments: EditableAttachment[]): string => {
    if (!attachments?.length) {
        return baseContent || '<p></p>';
    }

    const content = baseContent || '<p></p>';
    if (typeof window === 'undefined') {
        return content;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const existingSources = new Set<string>();
    doc.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src) {
            existingSources.add(src);
        }
    });

    const missingImages = attachments.filter((attachment) => attachment.storedPath && !existingSources.has(attachment.storedPath));
    if (!missingImages.length) {
        return content;
    }

    const combined = `${content}${missingImages.map(createAttachmentImageHtml).join('')}`;
    return combined;
};

const annotateContentWithAttachmentMeta = (content: string, attachments: EditableAttachment[]): string => {
    if (!content || !attachments?.length) {
        return content || '<p></p>';
    }
    if (typeof window === 'undefined') {
        return content;
    }

    const attachmentMap = new Map<string, number>();
    attachments.forEach((attachment) => {
        if (attachment.storedPath) {
            attachmentMap.set(attachment.storedPath, attachment.attachmentNo);
        }
    });

    if (!attachmentMap.size) {
        return content;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));

    images.forEach((img) => {
        const src = img.getAttribute('src');
        if (!src) {
            return;
        }
        const matchedAttachmentNo = attachmentMap.get(src);
        if (matchedAttachmentNo === undefined) {
            return;
        }
        img.setAttribute('data-attachment-no', String(matchedAttachmentNo));
        const parent = img.parentElement;
        if (parent && parent.nodeName === 'P') {
            parent.setAttribute('data-attachment-no', String(matchedAttachmentNo));
        }
    });

    return doc.body.innerHTML || '<p></p>';
};

const removeImageBySource = (
    html: string,
    options?: { targetSrc?: string; attachmentNo?: number },
): string => {
    if (typeof window === 'undefined') {
        return html;
    }

    const { targetSrc, attachmentNo } = options ?? {};
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));

    images.forEach((img) => {
        const srcMatches = targetSrc && img.getAttribute('src') === targetSrc;
        const dataAttr = img.getAttribute('data-attachment-no');
        const attachmentMatches = attachmentNo !== undefined && Number(dataAttr) === attachmentNo;

        if (srcMatches || attachmentMatches) {
            const parent = img.parentElement;
            img.remove();
            if (parent && parent.childNodes.length === 0) {
                parent.remove();
            }
        }
    });

    const nextHtml = doc.body.innerHTML || '<p></p>';
    return nextHtml;
};

const normalizeAttachment = (attachment: RawAttachment, index: number): EditableAttachment | null => {
    if (!attachment) {
        return null;
    }
    const storedPathCandidate =
        attachment.storedPath ??
        attachment.fileUrl ??
        attachment.url ??
        attachment.path ??
        attachment.filePath ??
        attachment.location ??
        '';
    const storedPath = typeof storedPathCandidate === 'string' ? storedPathCandidate : '';
    if (!storedPath) {
        return null;
    }

    const originalNameCandidate =
        attachment.originalName ??
        attachment.fileName ??
        (attachment as Record<string, unknown>).filename ??
        attachment.name ??
        '첨부파일';
    const originalName = typeof originalNameCandidate === 'string' && originalNameCandidate.trim().length > 0 ? originalNameCandidate : '첨부파일';

    const attachmentNoCandidate =
        attachment.attachmentNo ??
        (attachment as Record<string, unknown>).attachmentId ??
        (attachment as Record<string, unknown>).id ??
        (attachment as Record<string, unknown>).fileId ??
        null;
    const parsedAttachmentNo =
        typeof attachmentNoCandidate === 'number'
            ? attachmentNoCandidate
            : typeof attachmentNoCandidate === 'string'
            ? Number(attachmentNoCandidate)
            : null;

    const fileSizeCandidate = attachment.fileSize ?? (attachment as Record<string, unknown>).size ?? (attachment as Record<string, unknown>).file_size ?? 0;
    const fileSize =
        typeof fileSizeCandidate === 'number'
            ? fileSizeCandidate
            : typeof fileSizeCandidate === 'string'
            ? Number(fileSizeCandidate)
            : 0;

    const isVirtual = !Number.isFinite(parsedAttachmentNo) || (parsedAttachmentNo ?? 0) <= 0;

    return {
        attachmentNo: Number.isFinite(parsedAttachmentNo) ? Number(parsedAttachmentNo) : -(index + 1),
        originalName,
        storedPath,
        fileSize,
        isVirtual,
    };
};

const coerceAttachmentArray = (value: unknown): RawAttachment[] => {
    if (!value) {
        return [];
    }
    if (Array.isArray(value)) {
        return value as RawAttachment[];
    }
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (Array.isArray(record.content)) {
            return record.content as RawAttachment[];
        }
        return Object.values(record).filter(
            (item): item is RawAttachment => typeof item === 'object' && item !== null
        );
    }
    return [];
};

const estimateBase64Size = (dataUrl: string): number => {
    const base64Index = dataUrl.indexOf('base64,');
    if (base64Index === -1) {
        return 0;
    }
    const base64 = dataUrl.slice(base64Index + 7).trim();
    if (!base64) {
        return 0;
    }
    const paddingMatch = base64.match(/=+$/);
    const padding = paddingMatch ? paddingMatch[0].length : 0;
    return Math.max(Math.floor((base64.length * 3) / 4 - padding), 0);
};

const extractAttachmentsFromContent = (content?: string | null): EditableAttachment[] => {
    if (!content || typeof window === 'undefined') {
        return [];
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));
    return images
        .map((img, index): EditableAttachment | null => {
            const src = img.getAttribute('src');
            if (!src) {
                return null;
            }
            const alt = img.getAttribute('alt')?.trim() || `본문 이미지 ${index + 1}`;
            return {
                attachmentNo: -(index + 1000),
                originalName: alt,
                storedPath: src,
                fileSize: estimateBase64Size(src),
                isVirtual: true,
            };
        })
        .filter((attachment): attachment is EditableAttachment => Boolean(attachment));
};

const resolveBoardAttachments = (boardDetail?: BoardResponse | null): EditableAttachment[] => {
    if (!boardDetail) {
        return [];
    }
    const detailRecord = boardDetail as unknown as Record<string, unknown>;
    const rawLists = ATTACHMENT_KEYS.map((key) => coerceAttachmentArray(detailRecord[key])).flat();

    const normalized = rawLists
        .map((attachment, index) => normalizeAttachment(attachment, index))
        .filter((attachment): attachment is EditableAttachment => Boolean(attachment));

    const seen = new Set<string>();
    const unique = normalized.filter((attachment) => {
        const identifier = `${attachment.attachmentNo}-${attachment.storedPath}`;
        if (seen.has(identifier)) {
            return false;
        }
        seen.add(identifier);
        return true;
    });

    if (unique.length > 0) {
        return unique;
    }

    return extractAttachmentsFromContent(boardDetail.content);
};

const formatSize = (size: number) => {
    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)}MB`;
    }
    if (size >= 1024) {
        return `${(size / 1024).toFixed(2)}KB`;
    }
    return `${size}B`;
};

export default function WriteBoardPage() {
    const router = useRouter();
    const getBoardNoFromSearch = () => {
        if (typeof window === 'undefined') {
            return null;
        }
        return new URLSearchParams(window.location.search).get('boardNo');
    };
    const [boardNoParam, setBoardNoParam] = useState(getBoardNoFromSearch);
    useEffect(() => {
        const handlePopState = () => {
            setBoardNoParam(getBoardNoFromSearch());
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
    const parsedBoardNo = boardNoParam ? Number(boardNoParam) : NaN;
    const isEditMode = Number.isFinite(parsedBoardNo) && parsedBoardNo > 0;

    const [boardType, setBoardType] = useState<BoardType>('NOTICE');
    const [title, setTitle] = useState('');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<EditableAttachment[]>([]);
    const [deletedAttachmentNos, setDeletedAttachmentNos] = useState<number[]>([]);
    const [sendNotification, setSendNotification] = useState(true);
    const [showBoardTypeDropdown, setShowBoardTypeDropdown] = useState(false);
    const boardTypeDropdownRef = useRef<HTMLDivElement>(null);

    const createBoardMutation = useCreateAdminBoard();
    const updateBoardMutation = useUpdateAdminBoard();
    const createNotificationMutation = useCreateAdminNotification();
    const { data: boardDetail, isLoading: isDetailLoading } = useAdminBoardDetail(
        isEditMode ? parsedBoardNo : -1
    );
    const isPrefilledRef = useRef(false);
    const normalizedAttachments = useMemo(() => resolveBoardAttachments(boardDetail), [boardDetail]);

    const handleBackClick = () => {
        router.push('/admin/boards');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (boardTypeDropdownRef.current && !boardTypeDropdownRef.current.contains(event.target as Node)) {
                setShowBoardTypeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '내용을 입력해주세요...',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'tiptap-image',
                },
            }),
        ],
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!isEditMode || !boardDetail || !editor || isPrefilledRef.current) {
            return;
        }
        setBoardType(boardDetail.boardType);
        setTitle(boardDetail.title ?? '');
        const decodedContent = decodeHtmlContent(boardDetail.content ?? '');
        const annotatedContent = annotateContentWithAttachmentMeta(decodedContent, normalizedAttachments);
        const shouldAppendMissing = !isEditMode || !boardDetail?.content;
        const contentWithAttachments = shouldAppendMissing
            ? appendMissingAttachmentsToContent(annotatedContent, normalizedAttachments)
            : annotatedContent;
        editor.commands.setContent(contentWithAttachments || '<p></p>');
        setSendNotification(false);
        isPrefilledRef.current = true;
    }, [isEditMode, boardDetail, editor, normalizedAttachments]);

    useEffect(() => {
        if (!isEditMode) {
            setExistingAttachments([]);
            setDeletedAttachmentNos([]);
            return;
        }
        setExistingAttachments(normalizedAttachments);
        setDeletedAttachmentNos([]);
    }, [isEditMode, normalizedAttachments]);

    const handleRemoveExistingAttachment = (attachmentNo: number) => {
        const target = existingAttachments.find((attachment) => attachment.attachmentNo === attachmentNo);
        setExistingAttachments((prev) =>
            prev.filter((attachment) => attachment.attachmentNo !== attachmentNo)
        );
        if (target && !target.isVirtual && attachmentNo > 0) {
            setDeletedAttachmentNos((prev) =>
                prev.includes(attachmentNo) ? prev : [...prev, attachmentNo]
            );
        }
        if (editor) {
            const updatedHtml = removeImageBySource(editor.getHTML(), {
                targetSrc: target?.storedPath,
                attachmentNo,
            });
            editor.commands.setContent(updatedHtml || '<p></p>');
        }
    };

    const handleInsertExistingAttachment = (attachment: EditableAttachment) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: attachment.storedPath }).run();
    };

    const handleSubmit = async () => {
        if (!editor) return;
        const content = editor.getHTML();

        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        if (!content || content === '<p></p>') {
            alert('내용을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('boardType', boardType);
        formData.append('title', title.trim());
        formData.append('content', content);
        formData.append('sendNotification', String(sendNotification));

        const attachmentFieldName = isEditMode ? 'newAttachments' : 'attachments';

        uploadedImages.forEach((image) => {
            if (image.file) {
                formData.append(attachmentFieldName, image.file, image.name);
            }
        });

        deletedAttachmentNos.forEach((attachmentNo) => {
            formData.append('deleteAttachmentNos', String(attachmentNo));
        });

        if (!isEditMode && sendNotification) {
            const notificationPayload = {
                boardNo: null,
                sendToAllUsers: true,
            };
            formData.append('notification', JSON.stringify(notificationPayload));
        }

        try {
            if (isEditMode) {
                await updateBoardMutation.mutateAsync({ boardNo: parsedBoardNo, form: formData });
                alert('게시글이 수정되었습니다!');
            } else {
                const createdBoard = await createBoardMutation.mutateAsync(formData);

                if (sendNotification && createdBoard?.boardNo) {
                    await createNotificationMutation.mutateAsync({
                        boardNo: createdBoard.boardNo,
                        sendToAllUsers: true,
                    });
                }

                alert('게시글이 성공적으로 작성되었습니다!');
            }
            router.push('/admin/boards');
        } catch (err) {
            alert(err instanceof Error ? err.message : '게시글 작성 중 오류가 발생했습니다.');
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (!acceptedFiles.length) {
                return;
            }

            const currentAttachmentCount = existingAttachments.length + uploadedImages.length;
            if (currentAttachmentCount >= MAX_ATTACHMENT_COUNT) {
                alert(
                    `첨부파일은 최대 ${MAX_ATTACHMENT_COUNT}개까지만 등록할 수 있습니다. 기존 첨부를 삭제한 뒤 다시 시도해주세요.`,
                );
                return;
            }

            const availableSlots = MAX_ATTACHMENT_COUNT - currentAttachmentCount;
            if (acceptedFiles.length > availableSlots) {
                alert(`첨부파일은 최대 ${MAX_ATTACHMENT_COUNT}개까지만 등록할 수 있습니다. 나머지는 무시됩니다.`);
            }

            let runningTotalSize =
                existingAttachments.reduce((sum, attachment) => sum + (attachment.fileSize ?? 0), 0) +
                uploadedImages.reduce((sum, image) => sum + image.size, 0);

            const filesToAdd: File[] = [];

            for (const file of acceptedFiles) {
                if (filesToAdd.length >= availableSlots) {
                    break;
                }

                if (file.size > MAX_SINGLE_ATTACHMENT_SIZE) {
                    alert('첨부파일 하나당 최대 10MB까지 업로드할 수 있습니다.');
                    continue;
                }

                if (runningTotalSize + file.size > MAX_TOTAL_SIZE) {
                    alert('첨부파일 총 용량은 30MB를 넘길 수 없습니다.');
                    break;
                }

                filesToAdd.push(file);
                runningTotalSize += file.size;
            }

            if (!filesToAdd.length) {
                return;
            }

            filesToAdd.forEach(file => {
                const reader = new FileReader();
                reader.onload = () => {
                    setUploadedImages(prev => [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            name: file.name,
                            size: file.size,
                            src: reader.result as string,
                            file,
                            inserted: false,
                        },
                    ]);
                };
                reader.readAsDataURL(file);
            });
        },
        [existingAttachments, uploadedImages],
    );

    const handleInsertImage = (imageId: string) => {
        const image = uploadedImages.find(item => item.id === imageId);
        if (!image || !editor) return;
        editor.chain().focus().setImage({ src: image.src }).run();
        setUploadedImages(prev => prev.map(item => (
            item.id === imageId ? { ...item, inserted: true } : item
        )));
    };

    const handleRemoveImage = (imageId: string) => {
        const targetImage = uploadedImages.find(item => item.id === imageId);
        setUploadedImages(prev => prev.filter(item => item.id !== imageId));
        if (editor && targetImage?.src) {
            const updatedHtml = removeImageBySource(editor.getHTML(), { targetSrc: targetImage.src });
            editor.commands.setContent(updatedHtml || '<p></p>');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxSize: MAX_SINGLE_ATTACHMENT_SIZE,
    });

    const totalSize =
        existingAttachments.reduce((sum, attachment) => sum + (attachment.fileSize ?? 0), 0) +
        uploadedImages.reduce((sum, img) => sum + img.size, 0);

    return (
        <div className={styles.container}>
            <div className={styles.backButtonRow}>
                <button type="button" className={styles.backButton} onClick={handleBackClick} aria-label="공지사항 목록으로 이동">
                    <span className={styles.backIcon} aria-hidden="true" />
                    <span className={styles.backText}>목록으로</span>
                </button>
            </div>
            <h1 className={styles.title}>{isEditMode ? '공지사항 수정' : '새 공지사항 작성'}</h1>

            {isEditMode && isDetailLoading && (
                <p className={styles.loadingHint}>기존 게시글 정보를 불러오는 중입니다...</p>
            )}

            <div className={styles.inputGroup}>
                <label>게시판 분류</label>
                <div
                    ref={boardTypeDropdownRef}
                    className={`${styles.boxSelect} ${showBoardTypeDropdown ? styles.on : ''}`}
                >
                    <button
                        type="button"
                        className={styles.selectDisplayField}
                        onClick={() => setShowBoardTypeDropdown((prev) => !prev)}
                    >
                        {BOARD_TYPE_LABELS[boardType]}
                    </button>
                    <div
                        className={styles.selectArrowContainer}
                        onClick={() => setShowBoardTypeDropdown((prev) => !prev)}
                    >
                        <span className={styles.selectArrowIcon}></span>
                    </div>
                    <div className={styles.boxLayer}>
                        <ul className={styles.listOptions}>
                            {BOARD_TYPE_OPTIONS.map((option) => (
                                <li key={option} className={styles.listItem}>
                                    <button
                                        type="button"
                                        className={`${styles.buttonOption} ${
                                            option === boardType ? styles.buttonOptionSelected : ''
                                        }`}
                                        onClick={() => {
                                            setBoardType(option);
                                            setShowBoardTypeDropdown(false);
                                        }}
                                    >
                                        {BOARD_TYPE_LABELS[option]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="title">제목</label>
                <input
                    type="text"
                    id="title"
                    className={styles.inputField}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력해주세요."
                />
            </div>

            <div className={styles.editorGroup}>
                <label>내용</label>
                <div className={styles.editorWrapper}>
                    <EditorContent editor={editor} className={styles.editorContent} />
                </div>

                <div className={styles.imageDropzone}>
                    <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>이미지를 여기에 놓으면 업로드됩니다.</p>
                        ) : (
                            <>
                                <strong>사진 및 파일 첨부</strong>
                                <p>여기에 파일을 끌어 놓거나 클릭하여 업로드하세요.</p>
                            </>
                        )}
                    </div>
                    {(existingAttachments.length > 0 || uploadedImages.length > 0) && (
                        <div className={styles.attachmentPanel}>
                            <div className={styles.attachmentInfo}>
                                <span className={styles.attachmentBadge}>
                                    {existingAttachments.length + uploadedImages.length}
                                </span>
                                <span>개 첨부됨</span>
                                <span className={styles.totalFileSize}>
                                    {' '}
                                    ({formatSize(totalSize)} / {formatSize(MAX_TOTAL_SIZE)})
                                </span>
                            </div>
                            <ul className={styles.attachmentList}>
                                {existingAttachments.map((attachment) => (
                                    <li key={`existing-${attachment.attachmentNo}`} className={styles.attachmentItem}>
                                        <div className={styles.attachmentThumbWrap}>
                                            <img
                                                src={attachment.storedPath}
                                                alt={attachment.originalName}
                                                className={styles.attachmentThumb}
                                            />
                                        </div>
                                        <div className={styles.attachmentMeta}>
                                            <span className={styles.attachmentName}>{attachment.originalName}</span>
                                            <span className={styles.attachmentSize}>
                                                {formatSize(attachment.fileSize)}
                                            </span>
                                            <span className={styles.attachmentTag}>기존</span>
                                        </div>
                                        <div className={`${styles.attachmentActions} ${styles.existingAttachmentActions}`}>
                                            <button
                                                type="button"
                                                onClick={() => handleInsertExistingAttachment(attachment)}
                                                className={styles.insertButton}
                                            >
                                                본문 삽입
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingAttachment(attachment.attachmentNo)}
                                                className={styles.deleteButton}
                                                disabled={attachment.isVirtual}
                                            >
                                                {attachment.isVirtual ? '삭제 불가' : '삭제'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {uploadedImages.map(image => (
                                    <li key={image.id} className={styles.attachmentItem}>
                                        <div className={styles.attachmentThumbWrap}>
                                            <img src={image.src} alt={image.name} className={styles.attachmentThumb} />
                                        </div>
                                        <div className={styles.attachmentMeta}>
                                            <span className={styles.attachmentName}>{image.name}</span>
                                            <span className={styles.attachmentSize}>{formatSize(image.size)}</span>
                                        </div>
                                        <div className={styles.attachmentActions}>
                                            <button
                                                type="button"
                                                onClick={() => handleInsertImage(image.id)}
                                                className={styles.insertButton}
                                                disabled={image.inserted}
                                            >
                                                {image.inserted ? '삽입 완료' : '본문 삽입'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(image.id)}
                                                className={styles.deleteButton}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {!isEditMode && (
                <div className={styles.notificationGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={sendNotification}
                            onChange={(event) => setSendNotification(event.target.checked)}
                        />
                        <span>게시글 작성 후 모든 사용자에게 알림 전송</span>
                    </label>
                    <p className={styles.checkboxDescription}>
                        알림은 게시글 등록 후 자동으로 생성되며 전체 사용자에게 전달됩니다.
                    </p>
                </div>
            )}

            <div className={styles.buttonGroup}>
                <button onClick={() => router.push('/admin/boards')} className={styles.cancelButton}>취소</button>
                <button
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={isEditMode ? updateBoardMutation.isPending : createBoardMutation.isPending}
                >
                    {isEditMode
                        ? updateBoardMutation.isPending
                            ? '수정 중...'
                            : '수정'
                        : createBoardMutation.isPending
                        ? '작성 중...'
                        : '작성'}
                </button>
            </div>
        </div>
    );
}
