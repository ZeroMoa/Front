import styles from './page.module.css'

export const metadata = {
  title: '개인정보처리방침 - ZeroMoa',
  description: 'ZeroMoa의 개인정보처리방침 안내 페이지입니다.',
}

export default function PrivacyPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>개인정보처리방침</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. 개요</h2>
        <p className={styles.content}>
          제로모아(&quot;본 서비스&quot;)는 사용자의 개인정보를 중요하게 생각하며, 개인정보 보호에 최선을 다하고 있습니다. 
          본 개인정보처리방침은 본 서비스가 수집하는 정보와 그 사용 방법에 대해 설명합니다.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. 수집하는 정보</h2>
        <p className={styles.content}>
          본 서비스는 회원가입 및 서비스 이용을 위해 최소한의 개인정보를 수집합니다.
          {"\n"}- 수집 항목: 아이디, 비밀번호, 닉네임, 이메일
          {"\n"}- 수집 목적: 회원 가입 및 식별, 서비스 제공, 부정 이용 방지
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 정보의 보유 및 파기</h2>
        <p className={styles.content}>
          본 서비스는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
          부정 가입 및 이용 방지를 위해 회원 탈퇴 후 최대 3개월 동안 정보를 보관한 뒤 파기할 수 있습니다.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 제3자 제공 및 위탁</h2>
        <p className={styles.content}>
          본 서비스는 사용자의 동의 없이 개인정보를 외부에 제공하거나 위탁하지 않습니다. 
          단, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. 쿠키 및 분석</h2>
        <p className={styles.content}>
          본 웹사이트는 서비스 개선 및 방문 통계 분석을 위해 분석 도구를 사용할 수 있습니다. 
          이는 개인을 식별하지 않는 익명화된 정보만을 사용합니다.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. 정책 변경</h2>
        <p className={styles.content}>
          본 개인정보처리방침은 서비스 개선 및 법령 변경에 따라 수정될 수 있습니다. 
          중요한 변경 사항이 있을 경우 본 페이지를 통해 공지합니다.
        </p>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. 문의</h2>
        <p className={styles.content}>
          개인정보처리방침에 관한 문의 사항이 있으시면 운영자에게 연락해 주시기 바랍니다.
        </p>
      </section>

      <div className={styles.lastUpdate}>
        최종 업데이트: 2026년 1월 19일
      </div>
    </div>
    </div>
  )
}
