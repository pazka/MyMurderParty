export default (props : any) => {
    return <span className="select-wrapper">
        <select {...props}>
        </select>
        <span className="select-arrow"></span>
    </span>
}