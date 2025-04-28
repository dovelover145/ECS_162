"use strict";
(function() {
    const numOfArticles = 3;
    const minArticleLength = 250;
    
    window.addEventListener("load", init);
    
    function init() { /* Useful resource: https://stackoverflow.com/questions/4904667/html-how-do-articleIdx-insert-dynamic-date-in-webpage */
        insertDate();
        insertArticleContent();
    }

    function insertDate() {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const date = new Date();
        const year = date.getFullYear();
        const dayNum = date.getDate();
        const month = months[date.getMonth()];
        const dayOfWeek = days[date.getDay()];
        const dateStr = dayOfWeek + ", " + month + " " + dayNum + ", " + year + "\n\nDaily Paper";
        document.getElementById("date").innerText = dateStr;
    }

    async function insertArticleContent() {
        try {
            const apiKey = await getApiKey();
            const baseUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
            const url = new URL(baseUrl);
            url.search = new URLSearchParams(
                {
                    fq: "timesTag.location:(\"Davis\", \"Sacramento\")",
                    sort: "newest",
                    "api-key": `${apiKey}`
                }
            ).toString();
            console.log(url.toString())
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Couldn't retrieve the article content");
            }
            const responseObject = await response.json();
            const articles = responseObject["response"]["docs"];
            if (articles == null) {
                return;
            }
            let articlesFilled = 0;
            let articleIdx = 0;
            while (articlesFilled < numOfArticles && articleIdx < articles.length) {
                if (articles[articleIdx]["abstract"].length >= minArticleLength) {
                    if (articlesFilled == 0) {
                        document.getElementById("main-article-header").innerText = articles[articleIdx]["headline"]["main"];
                        if (articles[articleIdx]["multimedia"]["thumbnail"]["url"] != "") {
                            document.querySelector("#second > .image").src = articles[articleIdx]["multimedia"]["thumbnail"]["url"];
                            document.querySelector("#second > .image").src = articles[articleIdx]["multimedia"]["thumbnail"]["caption"];
                        }
                        document.querySelector("#second > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                    } else if (articlesFilled == 1) {
                        document.querySelector("#first > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                        document.querySelector("#first > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                    } else if (articlesFilled == 2) {
                        document.querySelector("#third > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                        document.querySelector("#third > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                    }
                    articlesFilled++;
                }
                articleIdx++;
            }
        } catch (error) {}
    }

    async function getApiKey() {
        const response = await fetch("/api/key");
        if (!response.ok) {
            throw new Error("Couldn't retrieve the API key");
        }
        try {
            const responseObject = await response.json();
            return responseObject.apiKey;
        } catch (error) {
            throw new Error("Couldn't translate the received API key");
        }
    }
})();