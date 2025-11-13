import Navbar from "./components/Navbar"
import SearchHeader from "../../components/SearchHeader"
import styles from "./layout.module.css"

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="limited-container">
                <SearchHeader />
                <div className={styles.container}>
                    <Navbar />
                    <div className={styles.mainContent}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}