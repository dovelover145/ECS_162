import {mount} from "svelte";
import "./app.css"; // Works without this
import App from "./App.svelte";

const app = mount(App, {target: document.getElementById('app')!,});
export default app; // Works without this

(function() {
    window.addEventListener("load", init);

    function init() {
        insertDate();
        insertArticleContent();
    }

    function insertDate() { // Useful resource: https://stackoverflow.com/questions/4904667/html-how-do-articleIdx-insert-dynamic-date-in-webpage
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const date = new Date();
        const year = date.getFullYear();
        const dayNum = date.getDate();
        const month = months[date.getMonth()];
        const dayOfWeek = days[date.getDay()];
        (document.getElementById("date") as HTMLElement).innerHTML = 
            `${dayOfWeek}, ${month} ${dayNum}, ${year}<br>
            <br>
            Daily Paper`;
    }

    async function insertArticleContent() {
        try {
            var apiKey = await getApiKey(); // Use var so that apiKey is accessible outside of the try block
        } catch (error) {
            throw new Error((error as Error).message);
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
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error("Couldn't retrieve the article content");
        }
        try {
            var respObj = await resp.json();
        } catch (error) {
            throw new Error("Couldn't translate the article content");
        }
        const articles = respObj["response"]["docs"];
        if (articles == null) { /* Exit */
            return;
        }
        let articleBlockIdx = 0;
        const articleBlocks = [{articleNum: "#second", headerType: "#main-article-header"}, {articleNum: "#first", headerType: ".article-header"}, {articleNum: "#third", headerType: ".article-header"}];
        for (const article of articles) {
            (document.querySelector(`${articleBlocks[articleBlockIdx]["articleNum"]} > ${articleBlocks[articleBlockIdx]["headerType"]}`) as HTMLElement).innerText = article["headline"]["main"];
            if (article["multimedia"]["default"]["url"] != "") {
                (document.querySelector(`${articleBlocks[articleBlockIdx]["articleNum"]} > .image`) as HTMLImageElement).src = article["multimedia"]["default"]["url"];
                (document.querySelector(`${articleBlocks[articleBlockIdx]["articleNum"]} > .image`) as HTMLImageElement).alt = article["multimedia"]["caption"];
            }
            (document.querySelector(`${articleBlocks[articleBlockIdx]["articleNum"]} > .article-paragraph`) as HTMLElement).innerText = article["abstract"];
            articleBlockIdx++;
            if (articleBlockIdx == articleBlocks.length) {
                break;
            }
        }
    }

    async function getApiKey() {
        const resp = await fetch("http://localhost:8000/api/key");
        if (!resp.ok) {
            throw new Error("Couldn't retrieve the API key");
        }
        try {
            var respObj = await resp.json(); // let and const are not visible outside of the try block; var is function-scoped, so it is
        } catch (error) {
            throw new Error("Couldn't translate the received API key");
        }
        return respObj.apiKey;
    }
})();