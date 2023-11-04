import React from "react";

class ErrorWrapper extends React.Component<any> {
    state = {
        hasError: false,
    };

    static getDerivedStateFromError(error : Error) {
        return {hasError: true};
    }

    componentDidCatch(error : Error, errorInfo : React.ErrorInfo) {
        // A custom error logging function
        console.error(error, errorInfo)
    }

    render() {
        return this.state.hasError ? <>Error in the render of this component</> : this.props.children;
    }
}

/**
 * @description If an error occur **during the render of the component** the component is rendered as a string that says an error occured, 
 * that way we handle render crash more robustly in case of a human coding error
 * 
 * @example export default withErrorCaught(MyComponent)
 * 
 * @param ComponentToWrap
 * @returns {React.Component}
 */
export const withErrorCaught = (ComponentToWrap : any) => (props : any) => <ErrorWrapper><ComponentToWrap {...props}/></ErrorWrapper>