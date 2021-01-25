const VirtualScroll = function(parentElem, scrollWrapElem, scrollBarWrapElem, scrollBarThumbElem){
    this.scroll = { x:0, y:0 };
    this.pos = { x:0, y:0 }
    this.easePos = { x:0, y:0 }
    this.delta = { x:0, y:0 }
    this.isSelf = false;
    let rAF = null;
    let clickedScrollBar = false;
    let mouseDownPos = { x:0, y:0 }
    let touchStartPos = { x:0, y:0 }
    const hasWheelEvent = "onwheel" in document;
    const hasMouseWheelEvent = "onmousewheel" in document;
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;

    const init = () => {
        initScrollEvent();
        initScrollBar();
        initScrollBarEvent();
    }

    const update = () => {
        rAF = requestAnimationFrame(update);

        this.easePos.y += (this.pos.y - this.easePos.y) * .1; // 0 - 1
        // console.log(+this.easePos.y.toFixed(5) )
        if(+this.easePos.y.toFixed(5) >= 0){
            scrollWrapElem.style.transform = 'none';
            scrollBarThumbElem.style.transform = 'none';
            this.off();
        }
        else{
            updateScrollWrapPos(this.easePos);
            udpateScrollBarPos(this.easePos);
        }
    }

    const updateScrollWrapPos = (pos) => {
        scrollWrapElem.style.transform = setTransform(`${pos.x * 100}%, ${pos.y * 100}%, 0`);
    }

    const onSelfDetection = (e) => {
        const target = e.target || e.srcElement;

        if(typeof target.closest === 'function'){
            const closestElem = target.closest(`.${parentElem.className}`);
            this.isSelf = selfDetection(closestElem);
        }
    }

    const selfDetection = (_target) => {
        return (_target === parentElem) ? true : false
    }

    const setTransform = (xyz) => {
        return `translate3d(${xyz})`;
    }

    const calcScrollTop = (_y = 0) => {
        let y = _y || this.scroll.y;
        const contentHeight = scrollWrapElem.offsetHeight - parentElem.offsetHeight;
        this.scroll.y = Math.max(Math.min(0, y), -contentHeight);
    }

    const calcPercentage = () => {
        let y = this.scroll.y / scrollWrapElem.offsetHeight;

        return {
            x: 0, 
            y: y
        };
    }

    const updatePos = () => {
        calcScrollTop();
        this.pos = calcPercentage();

        if(rAF === null && this.scroll.y !== 0){
            update();
        }
    }

    const initScrollBar = () => {
        updateScrollBarHeight();
    }

    const updateScrollBarHeight = () => {
        const scrollBarHeight = (parentElem.offsetHeight / scrollWrapElem.offsetHeight) * 100;
        if(scrollBarHeight >= 100)
            scrollBarWrapElem.classList.add('hide');
        else{
            scrollBarWrapElem.classList.remove('hide');
            scrollBarThumbElem.style.height = scrollBarHeight + "%";
        }
    }

    const udpateScrollBarPos = (_pos) => {
        const pos = {
            x: 0, 
            y: - (_pos.y / (1 - parentElem.offsetHeight / scrollWrapElem.offsetHeight)) * (scrollBarWrapElem.offsetHeight - scrollBarThumbElem.offsetHeight)
        };
        scrollBarThumbElem.style.transform = setTransform(`0, ${pos.y}px, 0`);
    }

    ////////////////////////
    ////////////////////////
    ////////////////////////

    const onMouseWheel = (e) => {
        if(this.isSelf){
            this.delta.x = (e.wheelDeltaX || e.deltaX) || (e.wheelDeltaY || e.deltaY) * -1;
            this.delta.y = e.wheelDeltaY || e.deltaY * -1;

            if(isFirefox){
                this.delta.x *= 15; // 15 is firefox multiplier for scroll
                this.delta.y *= 15; // 15 is firefox multiplier for scroll
            }

            this.scroll.y += this.delta.y;
            updatePos();
        }
    }

    const onTouchStart = (event) => {
        let e = event.touches ? event.touches[0] : event;
        onSelfDetection(e);

        if(this.isSelf){
            touchStartPos.x = e.pageX;
            touchStartPos.y = e.pageY;
            document.addEventListener('touchmove', onTouchMove, false);
            document.addEventListener('touchend', onTouchEnd, false);
        }
    }

    const onTouchMove = (event) => {
        let e = event.touches ? event.touches[0] : event;
        this.delta.x = (e.pageX - touchStartPos.x) * 2;
        this.delta.y = (e.pageY - touchStartPos.y) * 2;

        if(this.isSelf){
            this.scroll.y += this.delta.y;
            updatePos();
        }

        touchStartPos.x = e.pageX;
        touchStartPos.y = e.pageY;
    }

    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove, false);
    }

    const onClickScrollBar = (event) => {
        let e = event.touches ? event.touches[0] : event;
        e.preventDefault();
        clickedScrollBar = true;
        mouseDownPos.x = e.pageX;
        mouseDownPos.y = e.pageY;

        document.addEventListener('mousemove', onMoveScrollBar, false);
        document.addEventListener('mouseup', onReleaseScrollBar, false);
    }

    const onMoveScrollBar = (event) => {
        let e = event.touches ? event.touches[0] : event;
        if(clickedScrollBar){
            if(this.isSelf){
                const y = mouseDownPos.y - e.pageY;

                this.scroll.y += y * (scrollWrapElem.offsetHeight / parentElem.offsetHeight);
                updatePos();
                
                mouseDownPos.y = e.pageY;
            }
        }
    }

    const onReleaseScrollBar = () => {
        clickedScrollBar = false;

        document.removeEventListener('mousemove', onMoveScrollBar, false);
        document.removeEventListener('mouseup', onReleaseScrollBar, false);
    }

    const onResize = () => {
        updateScrollBarHeight();
    }

    const initScrollEvent = () => {
        if(hasWheelEvent) document.addEventListener("wheel", onMouseWheel, false);
        if(hasMouseWheelEvent) document.addEventListener('mousewheel', onMouseWheel, false);
        document.addEventListener('mousemove', onSelfDetection, false);
        document.addEventListener('touchstart', onTouchStart, false);
        window.addEventListener('resize', onResize, false);
    }
    
    const removeEvent = () => {
        if(hasWheelEvent) document.removeEventListener("wheel", onMouseWheel, false);
        if(hasMouseWheelEvent) document.removeEventListener('mousewheel', onMouseWheel, false);
        document.removeEventListener('mousemove', onSelfDetection, false);
        document.removeEventListener('touchstart', onTouchStart, false);
        window.removeEventListener('resize', onResize, false);
        removeScrollBarEvent();
    }

    const initScrollBarEvent = () => {
        scrollBarThumbElem.addEventListener('mousedown', onClickScrollBar, false);
    }

    const removeScrollBarEvent = () => {
        scrollBarThumbElem.removeEventListener('mousedown', onClickScrollBar, false);
    }

    this.getPos = () => {
        return pos;
    }

    this.to = (y) => {
        this.scroll.y = -y;
        updatePos(y);
    }

    this.set = (y) => {
        this.to(y);
        this.easePos.y = this.pos.y;
    }

    this.on = () => {
        console.log('on')
        if(rAF === null) update();
    }

    this.off = () => {
        console.log('off')
        cancelAnimationFrame(rAF);
        rAF = null;
    }

    this.reset = () => {
        this.set(0);
        onResize();
    }

    this.destroy = () => {
        this.off();
        removeEvent();
    }

    init();
}

export default VirtualScroll