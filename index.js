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
    function insertAllPage (pics) {
        const picContainer = document.querySelector('#hgallery')
        const picElements = Array.from(document.querySelectorAll('#hgallery > img'))

        pics.forEach(item => {
            const newNode = picElements[0].cloneNode()

            newNode.src = item
            picContainer.appendChild(newNode)
            picElements.push(newNode)
        })

        const ids = []
        picElements.forEach((node, index) => {
            const id = 'scroll-pic-' + index
            ids.push(id)

            node.id = id

            node.addEventListener('error', () => {
                node.parentNode.removeChild(node)
            })
        })

        return ids
    }

    function autoScrollPic(ids) {
        const len = ids.length

        let i = 0
        setInterval(() => {
            const next = document.querySelector('#' + ids[i % len])
            if (next) {
                document.querySelector('#' + ids[i % len]).scrollIntoView()
            }
            i++
        }, 3000)
    }

    // 启动
    (function main () {
        const page = readPage()
        const limit = readLimit()

        const pics = readAllPic(page, limit)
        const ids = insertAllPage(pics)

        autoScrollPic(ids)
    })()
})();