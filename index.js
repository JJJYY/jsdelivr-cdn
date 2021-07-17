// ==UserScript==
// @name         zngirls.com自动播放
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  zngirls.com自动播放脚本
// @author       JJJYY
// @match        https://www.nvshens.org/g/*
// @match        https://www.nvshens.org/g/*/*.html
// @match        https://www.nvshens.org/girl/*/
// @match        https://www.nvshens.org/girl/*/album/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function readPicUrlTemp () {
        const picElement = document.querySelector('#hgallery > img')

        return picElement.src
    }

    function replaceUrl (temp, index) {
        const number = index === 0 ? '0' : (index < 10 ? '00' + index : '0' + index)
        return temp.replace(/\d+(\.\w+)$/, number + '$1')
    }

    // 读出所有图片的URL
    function readAllPic (page, limit) {
        const picUrlTemp = readPicUrlTemp()

        const result = []
        for (let i = limit; i < page * limit; i++) {
            result.push(replaceUrl(picUrlTemp, i))
        }

        return result
    }

    // 读出页数
    function readPage () {
        const pageContainer = document.querySelector('#pages')

        return pageContainer.children.length - 2
    }

    // 读出每页的图片数
    function readLimit () {
        const picContainer = document.querySelector('#hgallery')

        return picContainer.children.length
    }

    // 插入图片
    function getAllPicElements (pics) {
        const picContainer = document.querySelector('#hgallery')
        const picElements = Array.from(document.querySelectorAll('#hgallery > img'))

        picElements.forEach(item => {
            picContainer.removeChild(item)
        })
        pics.forEach(item => {
            const newNode = picElements[0].cloneNode()

            newNode.src = item
            picElements.push(newNode)
        })

        return picElements
    }

    function createElement(tag, className) {
        const ele = document.createElement(tag);
        ele.className = className;

        return ele
    }

    function transform2Swiper(items = []) {
        const style = createElement('style');
        style.innerText = `
            .swiper-container {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 2147483648;
                width: 100vw;
                height: 100vh;
                background: #fff;
            }
            .swiper-slide {
                object-fit: contain;
            }
        `
        document.head.appendChild(style)
        const container = createElement('div', 'swiper-container');
        const wrapper = createElement('div', 'swiper-wrapper');

        container.appendChild(wrapper)
        items.forEach(item => {
            const slide = createElement('img', 'swiper-slide');
            slide.src = item.src;
            wrapper.appendChild(slide)
        })
        document.body.appendChild(container)
        setTimeout(() => {
            new window.Swiper('.swiper-container', {
                autoplay: {
                    delay: 3000
                },
                slidesPerView: 'auto',
                centeredSlides: true,
                spaceBetween: 30,
                pagination: {
                el: '.swiper-pagination',
                clickable: true,
                },
            });
        }, 2000)

        const timer = setInterval(() => {
            if (container.nextElementSibling) {
                document.body.removeChild(container.nextElementSibling)
                clearInterval(timer)
            }
        }, 500)
    }

    function insertSource(src) {
        let source = null
        if (src.indexOf('.js') > -1) {
            source = document.createElement('script');
            source.src = src;
        } else if (src.indexOf('.css') > -1) {
            source = document.createElement('link');
            source.rel = 'stylesheet'
            source.href = src;
        }

        source && document.head.appendChild(source);

        return Promise.resolve();
    }
    Promise.all([
        insertSource('//unpkg.com/swiper/swiper-bundle.min.css'),
        insertSource('//unpkg.com/swiper/swiper-bundle.min.js')
    ]).then(() => {
        const page = readPage()
        const limit = readLimit()

        const pics = readAllPic(page, limit)
        const elements = getAllPicElements(pics)

        transform2Swiper(elements)
    })
})();