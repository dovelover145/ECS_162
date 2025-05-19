"use strict";
(function() {
    const numOfArticles = 3; /* The number of articles on the web page */
    const minArticleDescriptionLen = 0; /* The minimum number of characters in the article's description */

    let currentUser = null; // Store user info
    if (typeof window != "undefined") { /* Will skip over this for unit tests: https://stackoverflow.com/questions/14164505/javascript-window-is-not-defined */
        window.addEventListener("load", init);
    }

    function init() { /* Useful resource: https://stackoverflow.com/questions/4904667/html-how-do-articleIdx-insert-dynamic-date-in-webpage */
        insertDate();
        insertArticleContent();
        fetch("/get_user")
            .then(res => res.json())
            .then(data => {
                currentUser = data.user;
                console.log(">>> currentUser:", currentUser);
                updateHeaderLoginState();
            });
    }

        function updateHeaderLoginState() { //upate if logged in
        const loginBtn = document.querySelector("button[onclick='login()']");
        if (!currentUser || !currentUser.name) return;

        const dropdown = document.createElement("div");
        dropdown.className = "dropdown";
        dropdown.innerHTML = `
            <button class="opening-line-button">Account ▼</button>
            <div class="dropdown-content">
                <a href="#" onclick="logout()">Logout</a>
            </div>
        `;
        loginBtn.replaceWith(dropdown);
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

    function login() {
        const url = "http://localhost:8000/login"
        window.location.href = url;
    }
    function logout() {
        const url = "http://localhost:8000/logout";
        window.location.href = url;
    }
    function display_sidebar(show) {
    const sidebar = document.getElementById("comment_sidebar");
        if (!sidebar) {
            console.error("Sidebar element not found.");
            return;
        }
        if (show) {
            sidebar.classList.remove("hidden");
        } else {
            sidebar.classList.add("hidden");
        }
}
    async function openSidebar(articleUrl){
    //     todo, grabe data from mongodb and display them
        display_sidebar(true);
        const commentList = document.getElementById('sidebar_comments_list');
        commentList.innerHTML = "";
        //get the specific url for later
        document.getElementById("sidebar_make_comments").dataset.articleUrl = articleUrl;
        document.getElementById("sidebar_make_comments").dataset.parentId = "";
        const res = await fetch("/get_comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ article_url: articleUrl })
        });
        const comments_list = await res.json();
        console.log(">>> loaded comments:", comments_list);
        const commentMap = {};
        const rootComments = [];

        comments_list.forEach(c => {
            c.children = [];
            commentMap[c._id] = c;
        });
        //if it is root comment,push it, if it has a parent comment,push as a child.
        comments_list.forEach(c => {
            if (c.parent_id && commentMap[c.parent_id]) {
                commentMap[c.parent_id].children.push(c);
            } else {
                rootComments.push(c);
            }
        });
        rootComments.forEach(c => listComment(c, commentList));
    }

    function listComment(comment,commentList){
        //this funtion will show individual
            const li = document.createElement("li");
            li.innerHTML = `<b>${comment.user}</b><br>${comment.comment}`;
            const comment_section = document.createElement("div");
            const replyBtn = document.createElement("button");

            replyBtn.innerText = "Reply";//able to reply to indicidual reply
            replyBtn.onclick = () => {
            const existing = comment_section.querySelector(".reply-box");
            if (existing) {
                existing.remove();
                return;
            } //allow click to remove display input area

            const container = document.createElement("div");
            container.className = "reply-box";
            if (comment_section.querySelector("textarea")) return;
            const input = document.createElement("textarea");
            input.placeholder = "Type here";

            const submitBtn = document.createElement("button");
            submitBtn.innerText = "Submit"
            submitBtn.onclick = () => {
                const reply = input.value.trim();
                const articleUrl = document.getElementById("sidebar_make_comments").dataset.articleUrl;
                submitComment_Uni(reply, articleUrl, comment._id);
            };
            container.appendChild(input);
            container.appendChild(submitBtn);
            comment_section.appendChild(container);
            };
            comment_section.appendChild(replyBtn);
            console.log(">>> currentUser check:", currentUser);

            if (currentUser.name ==="admin" || currentUser.name === "moderator"){

                const deleteBtn = document.createElement("button");
                deleteBtn.innerText = "Delete";
                deleteBtn.classList.add("delete-button");
                deleteBtn.onclick = async () => {
                    console.log(">>> Deleting comment id:", comment._id);
                    await fetch("/delete_comment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: comment._id })
                    });
                    //rerender
                    openSidebar(document.getElementById("sidebar_make_comments").dataset.articleUrl);
                };
                comment_section.appendChild(deleteBtn);
            }

            li.appendChild(comment_section);
            if (comment.children && comment.children.length > 0) {
                const childrenUl = document.createElement("ul");
                comment.children.forEach(child => listComment(child, childrenUl));
                li.appendChild(childrenUl);//render the child comments and append them
            }
            commentList.appendChild(li);
        }
    function submit_Comment(event) {
    event.preventDefault();
    const form = event.target;
    const textarea = form.querySelector("textarea");
    const articleUrl = form.dataset.articleUrl;
    const parentId = form.dataset.parentId || null;

    submitComment_Uni(textarea.value, articleUrl, parentId);
    textarea.value = "";
    form.dataset.parentId = "";
}
    function submitComment_Uni(commentText, articleUrl, parentid = null) {
        const comment = commentText.trim();
        if (!comment) return;
            if (!currentUser || !currentUser.name) {
            alert("You need to login to submit comments!");
            login();
            return;
        }
        fetch("/made_comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment,
                article_url: articleUrl,
                parent_id: parentid })
        })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                console.error("Server error:", res.status);
                alert("Error calling backend");
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data.status === "success") {
                openSidebar(articleUrl);
            } else {
                alert("Failed to post comment.");
            }
        });
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
                    document.getElementById("second").dataset.articleUrl = articles[articleIdx]["web_url"];
                } else if (articlesFilled == 1) {
                    document.querySelector("#first > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                    if (articles[articleIdx]["multimedia"]["default"]["url"] != "") {
                        document.querySelector("#first > .image").src = articles[articleIdx]["multimedia"]["default"]["url"];
                        document.querySelector("#first > .image").alt = articles[articleIdx]["multimedia"]["caption"];
                    }
                    document.querySelector("#first > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                    document.getElementById("first").dataset.articleUrl = articles[articleIdx]["web_url"];
                } else if (articlesFilled == 2) {
                    document.querySelector("#third > .article-header").innerText = articles[articleIdx]["headline"]["main"];
                    if (articles[articleIdx]["multimedia"]["default"]["url"] != "") {
                        document.querySelector("#third > .image").src = articles[articleIdx]["multimedia"]["default"]["url"];
                        document.querySelector("#third > .image").alt = articles[articleIdx]["multimedia"]["caption"];
                    }
                    document.querySelector("#third > .article-paragraph").innerText = articles[articleIdx]["abstract"];
                    document.getElementById("third").dataset.articleUrl = articles[articleIdx]["web_url"];
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

    //Expose functions so they can be find
    window.login = login;
    window.openSidebar = openSidebar;
    window.submit_Comment = submit_Comment;
    window.logout = logout;
    function close_sidebar() {
    document.getElementById("comment_sidebar").classList.add("hidden");
    }
    window.close_sidebar = close_sidebar;


    if (typeof module != "undefined") { /* For unit tests */
        module.exports = {
            getApiKey,
            insertArticleContent,
            listComment,
            submitComment_Uni,
            openSidebar
        };
    }
})();