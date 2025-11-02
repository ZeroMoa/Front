'use client'

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useDropzone } from 'react-dropzone';
import { useCreateBoard } from '../../hooks/useBoard';
import { BoardType } from '../../../types/board';
import { BOARD_TYPE_LABELS, BOARD_TYPE_OPTIONS } from '../../../constants/board';

interface UploadedImage {
    id: string;
    name: string;
    size: number;
    src: string;
    file: File;
    inserted: boolean;
}

export default function WriteBoardPage() {
    const router = useRouter();
    const [boardType, setBoardType] = useState<BoardType>('NOTICE');
    const [title, setTitle] = useState('');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    const createBoardMutation = useCreateBoard();

    const handleBackClick = () => {
        router.push('/board');
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: '내용을 입력해주세요...',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'link',
                },
            }),
            Image.configure({
                inline: true,
                HTMLAttributes: {
                    class: 'tiptap-image',
                },
            }),
        ],
        content: '<p>Hello World! 🌎️</p>',
        immediatelyRender: false,
    });

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

        uploadedImages.forEach((image) => {
            if (image.file) {
                formData.append('attachments', image.file, image.name);
            }
        });

        try {
            await createBoardMutation.mutateAsync(formData);
            alert('게시글이 성공적으로 작성되었습니다!');
            router.push('/board');
        } catch (err) {
            alert(err instanceof Error ? err.message : '게시글 작성 중 오류가 발생했습니다.');
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach(file => {
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
                    }
                ]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleInsertImage = (imageId: string) => {
        const image = uploadedImages.find(item => item.id === imageId);
        if (!image || !editor) return;
        editor.chain().focus().setImage({ src: image.src }).run();
        setUploadedImages(prev => prev.map(item => (
            item.id === imageId ? { ...item, inserted: true } : item
        )));
    };

    const handleRemoveImage = (imageId: string) => {
        setUploadedImages(prev => prev.filter(item => item.id !== imageId));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    const formatSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)}MB`;
        }
        return `${(size / 1024).toFixed(2)}KB`;
    };

    const totalSize = uploadedImages.reduce((sum, img) => sum + img.size, 0);

    return (
        <div className={styles.container}>
            <div className={styles.backButtonRow}>
                <button type="button" className={styles.backButton} onClick={handleBackClick} aria-label="공지사항 목록으로 이동">
                    <span className={styles.backIcon} aria-hidden="true" />
                    <span className={styles.backText}>목록으로</span>
                </button>
            </div>
            <h1 className={styles.title}>새 공지사항 작성</h1>

            <div className={styles.inputGroup}>
                <label htmlFor="boardType">게시판 분류</label>
                <select
                    id="boardType"
                    className={styles.selectField}
                    value={boardType}
                    onChange={(event) => setBoardType(event.target.value as BoardType)}
                >
                    {BOARD_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {BOARD_TYPE_LABELS[option]}
                        </option>
                    ))}
                </select>
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
                    {uploadedImages.length > 0 && (
                        <div className={styles.attachmentPanel}>
                            <div className={styles.attachmentInfo}>
                                <span className={styles.attachmentBadge}>{uploadedImages.length}</span>
                                <span>개 첨부됨</span>
                                <span className={styles.totalFileSize}>
                                    {' '}
                                    ({(totalSize / (1024 * 1024)).toFixed(2)}MB / 50.00MB)
                                </span>
                            </div>
                            <ul className={styles.attachmentList}>
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

            <div className={styles.buttonGroup}>
                <button onClick={() => router.push('/board')} className={styles.cancelButton}>취소</button>
                <button onClick={handleSubmit} className={styles.submitButton} disabled={createBoardMutation.isPending}>
                    {createBoardMutation.isPending ? '작성 중...' : '작성'}
                </button>
            </div>
        </div>
    );
}
