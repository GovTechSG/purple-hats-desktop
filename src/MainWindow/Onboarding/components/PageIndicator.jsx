const PageIndicator = ({page}) => {
    const currentPageIndicatorClassName = "page-indicator-circle current"; 
    const pageIndicatorClassName = "page-indicator-circle";

    const page1ClassName = (page === 1) ? currentPageIndicatorClassName : pageIndicatorClassName;
    const page2ClassName = (page === 2) ? currentPageIndicatorClassName : pageIndicatorClassName; 
    const page3ClassName = (page === 3) ? currentPageIndicatorClassName : pageIndicatorClassName;
    const page4ClassName = (page === 4) ? currentPageIndicatorClassName : pageIndicatorClassName; 

    return (
        <div className="page-indicators">
            <div className={page1ClassName}></div>
            <div className={page2ClassName}></div>
            <div className={page3ClassName}></div>
            <div className={page4ClassName}></div>
        </div>
    )
}

export default PageIndicator;
