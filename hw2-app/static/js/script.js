"use strict";
(function() {
    const numOfArticles = 3; /* The number of articles on the web page */
    const minArticleDescriptionLen = 0; /* The minimum number of characters in the article's description */

    if (typeof window != "undefined") { /* Will skip over this for unit tests: https://stackoverflow.com/questions/14164505/javascript-window-is-not-defined */
        window.addEventListener("load", init);
    }

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
            var apiKey = await getApiKey();
        } catch (error) {
            throw new Error(error);
        }
        const baseUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
        const url = new URL(baseUrl);
        url.search = new URLSearchParams(
            {
                q: "Sacramento Davis",
                fq: "timesTag.location.contains:(\"Sacramento\", \"Davis\")",
                sort: "best",
                "api-key": `${apiKey}`
            }
        ).toString();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Couldn't retrieve the article content");
        }
        try {
            var responseObject = await response.json();
        } catch (error) {
            throw new Error("Couldn't translate the article content");
        }
        const articles = responseObject["response"]["docs"];
        if (articles == null) { /* Exit */
            return;
        }
        let articlesFilled = 0;
        let articleIdx = 0;
        while (articlesFilled < numOfArticles && articleIdx < articles.length) {
            if (articles[articleIdx]["abstract"].length >= minArticleDescriptionLen) {
                if (articlesFilled == 0) {
                    document.getElementById("main-article-header").innerText = articles[articleIdx]["headline"]["main"];
                    if (articles[articleIdx]["multimedia"]["default"]["url"] != "") {
                        document.querySelector("#second > .image").src = articles[articleIdx]["multimedia"]["default"]["url"];
                        document.querySelector("#second > .image").alt = articles[articleIdx]["multimedia"]["caption"];
                    }
                    document.querySelector("#second > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                } else if (articlesFilled == 1) {
                    document.querySelector("#first > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                    if (articles[articleIdx]["multimedia"]["default"]["url"] != "") {
                        document.querySelector("#first > .image").src = articles[articleIdx]["multimedia"]["default"]["url"];
                        document.querySelector("#first > .image").alt = articles[articleIdx]["multimedia"]["caption"];
                    }
                    document.querySelector("#first > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                } else if (articlesFilled == 2) {
                    document.querySelector("#third > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                    if (articles[articleIdx]["multimedia"]["default"]["url"] != "") {
                        document.querySelector("#third > .image").src = articles[articleIdx]["multimedia"]["default"]["url"];
                        document.querySelector("#third > .image").alt = articles[articleIdx]["multimedia"]["caption"];
                    }
                    document.querySelector("#third > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                }
                articlesFilled++;
            }
            articleIdx++;
        }
    }

    async function getApiKey() {
        const response = await fetch("/api/key");
        if (!response.ok) {
            throw new Error("Couldn't retrieve the API key");
        }
        try {
            var responseObject = await response.json(); /* let and const are not visible outside of the try block; var is function-scoped, so it is */
        } catch (error) {
            throw new Error("Couldn't translate the received API key");
        }
        return responseObject.apiKey;
    }

    if (typeof module != "undefined") { /* For unit tests */
        module.exports = {
            getApiKey,
            insertArticleContent
        };
    }
})();