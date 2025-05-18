<script lang="ts">
    import Comment from "./lib/Comment.svelte";

    /*
     -This default image will be displayed if the NYT API isn't working
     -Link: https://unsplash.com/photos/chrysler-building-new-york-aTWNx7yoJWo
     -By Mark Boss
     -Free to use under the Unsplash License 
    */
    import defaultImage from "./assets/images/photo-1570304816841-906a17d7b067.jpeg";

    let loggedIn = $state(false); // Keeps track of whether the user is logged in or not
    let comments = $state([]); // Stores comments
    let user = $state(""); // Stores the current user
    let curComment = $state(""); // Stores the current comment entered by the user

    window.addEventListener("DOMContentLoaded", getUser); // Gets the current user

    async function getUser() {
        try {
            const resp = await fetch(
                "http://localhost:8000/get_user",
                {credentials: "include"} // Tells browser to send cookie; otherwise, it doesn't work
            ); // Get the user that logged in
            if (!resp.ok) {
                throw new Error("Failed to log in");
            }
            const respObj = await resp.json();
            if (respObj.valid) { // There is a valid user logged in
                user = respObj.username;
                getComments(); // Get the comments from the database
                loggedIn = true;
            }
        } catch (error) {
            // Swallow it
        }
    }

    async function getComments() {
        try {
            const resp = await fetch("http://localhost:8000/get_comments");
            if (!resp.ok) {
                throw new Error("Failed to get the comments");
            }
            const respObj = await resp.json();
            console.log(respObj);
            comments = respObj;
        } catch (error) {
            console.log(error);
            alert(error.message || "Something went wrong while getting the comments");
        }
    }
    
    /*
     -This function is called when the user presses the login button
     -It will route the user to the Dex UI to enter their login information (through a Flask route)
     -Flask will eventually redirect the user back to the web page (now being logged in)
    */
    async function logIn() {
        window.location.href = "http://localhost:8000/login";
    }

    /*
     -This function will log the user out
     -Comments will no longer be displayed after being logged out
    */
    function logOut() {
        loggedIn = false;
        user = "";
        comments = [];
        window.location.href = "http://localhost:8000/logout";
    }

    async function postComment(event: Event) {
        event.preventDefault(); // Don't refresh the page
        if (curComment.trim() == "") { // Prevents comments with only whitespace from falling through
            return
        }
        try {
            const resp = await fetch("http://localhost:8000/post_comment", { // Store in the database through the Flask backend route
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify({username: user, comment: curComment})
                });
            if (!resp.ok) {
                throw new Error("Failed to post the comment");
            }
            const respObj = await resp.json();
            const _id = respObj._id; // Used for uniquely identifying comments
            comments = [{_id: _id, username: user, comment: curComment}, ...comments];
        } catch(error) { // The comment-posting had issues
            console.log(error);
            alert(error.message || "Something went wrong while posting the comment");
        } finally {
            curComment = ""; // Reset
        }
    }
</script>

<header> <!-- Header content -->
    <div id="header-container">
        <div id="opening-line-container">
            <div><button class="opening-line-button">SEARCH</button></div>
            <div id="website-versions">U.S. INTERNATIONAL CANADA ESPAÑOL 中文</div>
            <div>
                <button class="opening-line-button">SUBSCRIBE FOR 1$/WEEK</button>
                {#if !loggedIn}
                    <button class="opening-line-button" onclick={logIn}>LOG IN</button> <!-- This is the login button -->
                {:else}
                    <button class="opening-line-button" onclick={logOut}>LOG OUT</button> <!-- This is the logout button -->
                {/if}
            </div>
        </div>
        <div id="title-container">
            <div class="title-element">
                <p id="date">Monday, May 18, 2025<br>
                            <br>
                            Daily Paper
                </p>
            </div>
            <div id="title">The New York Times</div>
            <div class="title-element">Nasdaq <span id="percentage">5.32%</span></div>
        </div>
        <hr class="dividing-line">
        <div id="live-line"><span class="live">LIVE:</span> LOREM IPSUM | <span class="live">LIVE:</span> LOREM IPSUM</div>
        <hr class="dividing-line">
    </div>
</header>

<main> <!-- Main content (including the articles and the comment section) -->
    <div class="article-container">
        <div id="first">
            <h1 class="article-header">Lorem ipsum dolor sit amet.</h1>
            <img class="image" src={defaultImage} alt="Manhattan Skyline">
            <p class="article-paragraph">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit officia voluptate illum? Sint qui facere deserunt assumenda laudantium magni obcaecati, sed quos. Qui laboriosam veritatis facere reiciendis, deserunt quaerat ad aperiam fuga eum sapiente dolorem iusto quos impedit ex placeat! Accusamus, ad. Quos culpa, animi odit dolorum saepe deserunt eveniet?</p>
        </div>
        <div id="second">
            <h1 id="main-article-header">Lorem ipsum dolor sit amet.</h1>
            <img class="image" src={defaultImage} alt="Manhattan Skyline">
            <p class="article-paragraph">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reprehenderit officia voluptate illum? Sint qui facere deserunt assumenda laudantium magni obcaecati, sed quos. Qui laboriosam veritatis facere reiciendis, deserunt quaerat ad aperiam fuga eum sapiente dolorem iusto quos impedit ex placeat! Accusamus, ad. Quos culpa, animi odit dolorum saepe deserunt eveniet?</p>
        </div>
        <div id="third">
            <h1 class="article-header">Lorem ipsum dolor sit amet.</h1>
            <img class="image" src={defaultImage} alt="Manhattan Skyline">
            <p class="article-paragraph">Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque enim magni officiis molestiae. Dolores officiis earum maxime ut velit doloremque modi maiores magni possimus nulla.</p>
        </div>
    </div>
    <hr class="dividing-line">
    {#if loggedIn} <!-- Comments section -->
        <div id="comments-container">
            <h3>Comments</h3>
            <form onsubmit={postComment}>
                <label>
                    Post a Comment: <input type="text" bind:value={curComment} />
                </label>
                <button type="submit">Enter</button>
            </form>
        </div>
        {#each comments as comment}
            <Comment bind:_id={comment._id} bind:username={comment.username} bind:comment={comment.comment}></Comment>
        {/each}
    {:else}
        <div id="log-in-container">
            <p>Log in to comment</p>
        </div>
    {/if}
</main>


<style>
    #comments-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: nowrap;
        font-family: Georgia;
    }

    #comments-container form input {
        font-family: Georgia;
    }

    #comments-container form button {
        background-color: steelblue;
        border-color: steelblue;
        border-radius: 5px; /* Curvature of the button */
        color: white;
        font-family: Georgia;
        font-weight: 1000;
    }

    #comments-container form button:hover {
        background-color: rgb(0, 95, 170);
        border-color: rgb(0, 95, 170);
        cursor: pointer;
    }

    #log-in-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: nowrap;
        font-family: Georgia;
    }
</style>