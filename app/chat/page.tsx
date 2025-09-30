'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import ResultPage from './result';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface ChatMessage {
  text?: string;
  component?: React.ReactNode;
  isUser: boolean;
}

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  // 초기 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색 쿼리 처리를 위한 별도의 함수
  const handleSearchQuery = async (searchQuery: string) => {
    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      text: searchQuery,
      isUser: true
    };
    setMessages([userMessage]);
    
    // API 호출
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:9000/chat/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      console.log('API 응답:', data);
      console.log('응답 타입:', typeof data);
      
      // 답변할 수 없는 질문입니다. 응답 처리
      if (typeof data === 'string' && data.includes('답변할 수 없는 질문입니다')) {
        const noAnswerMessage: ChatMessage = {
          text: '답변할 수 없는 질문입니다.',
          isUser: false
        };
        setMessages(prev => [...prev, noAnswerMessage]);
      } else {
        // 검색 결과가 있는 경우
        const botMessage: ChatMessage = {
          component: <ResultPage products={data} />,
          isUser: false
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('에러 발생:', error);
      // 에러 메시지 추가
      const errorMessage: ChatMessage = {
        text: '오류가 발생했습니다.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    if (!mounted) return;
    
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      handleSearchQuery(searchQuery);
    }
  }, [searchParams, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      text: query,
      isUser: true
    };

    // 입력창 즉시 비우기
    setQuery('');
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:9000/chat/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('API 응답:', data);
      console.log('응답 타입:', typeof data);
      
      // 답변할 수 없는 질문입니다. 응답 처리
      if (typeof data === 'string' && data.includes('답변할 수 없는 질문입니다')) {
        const noAnswerMessage: ChatMessage = {
          text: '답변할 수 없는 질문입니다.',
          isUser: false
        };
        setMessages(prev => [...prev, noAnswerMessage]);
      }
      // 검색 결과가 없는 경우 처리
      else if (!Array.isArray(data) || data.length === 0) {
        const noResultMessage: ChatMessage = {
          text: '죄송합니다. 해당하는 제품이 없습니다.',
          isUser: false
        };
        setMessages(prev => [...prev, noResultMessage]);
      } else {
        const botMessage: ChatMessage = {
          component: <ResultPage products={data} />,
          isUser: false
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('에러 발생:', error);
      const errorMessage: ChatMessage = {
        text: error instanceof Error ? error.message : '오류가 발생했습니다.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`${styles.messageWrapper} ${message.isUser ? styles.user : styles.bot}`}
            >
              <div className={`${styles.messageLabel} ${message.isUser ? styles.userLabel : styles.botLabel}`}>
                {message.isUser ? '사용자' : '제로모아'}
              </div>
              <div className={`${styles.message} ${message.isUser ? styles.user : styles.bot}`}>
                {message.text ? message.text : message.component}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          <form onSubmit={handleSubmit} className={styles.searchContainer}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              placeholder="질문을 입력하세요..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={styles.searchButton}
            >
              <Image 
                src="/images/search.png" 
                alt="검색" 
                width={20} 
                height={20} 
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
