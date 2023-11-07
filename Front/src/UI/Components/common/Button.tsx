import { ReactNode } from "react"
import './Button.scss'

export default ({
    onClick,
    children,
    variant = "secondary"
}: {
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void,
    children: ReactNode,
    variant? : string
}) => {
    return (
        <button className={`${variant}`} onClick={onClick}>{children}</button>
    )
}