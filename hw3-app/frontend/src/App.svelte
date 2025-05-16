<script lang="ts">
    import Comment from "./lib/Comment.svelte";

    /*
     -This default image will be displayed if the NTY API isn't working
     -Link: https://unsplash.com/photos/chrysler-building-new-york-aTWNx7yoJWo
     -By Mark Boss
     -Free to use under the Unsplash License 
    */
    import defaultImage from "./assets/images/photo-1570304816841-906a17d7b067.jpeg";

    /* 
     -This keeps track of whether the user is logged in or not 
     -If the user is logged in (i.e. true), the comments section is displayed
    */
    let loggedIn = $state(false);

    /*
     -This is where comments (from the backend's associated database) are stored
     -Comments consist of a username, the comment itself, and an array of subcomments (where each has a username and comment)
    */
    let comments = $state([{username: "Bob Bobberton", comment: "Svelte rocks!", subcomments: [{username: "King Joe III", comment: "Yes!"}]}, {username: "Papa John", comment: "Want some pizza?", subcomments: []}]);

    let commentUsername = $state(""); // Stores the current username
    let commentComment = $state(""); // Stores the current comment
    
    /*
     -This function is called when the user presses the login button
     -It will route the user to the Dex UI to enter their information (through a Flask route)
     -Flask will handle the rest
    */
    function logIn() {
        // window.location.href = "http://dex:5556/.well-known/openid-configuration"; // Point to a Flask route?
        loggedIn = true;
    }

    /*
     -This function will log the user out
     -Comments will no longer be displayed after being logged out
    */
    function logOut() {
        loggedIn = false;
    }

    function postComment(event: Event) {
        event.preventDefault();
        comments = [{username: commentUsername, comment: commentComment, subcomments: []}, ...comments];
        commentUsername = "";
        commentComment = "";
    }

    function deleteComment() {
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
                    <button class="opening-line-button" on:click={logIn}>LOG IN</button> <!-- This is the login button -->
                {:else}
                    <button class="opening-line-button" on:click={logOut}>LOG OUT</button> <!-- This is the logout button -->
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
            <h1>Comments</h1>
            <form on:submit={postComment}>
                <label>
                    Username: <input type="text" bind:value={commentUsername} />
                </label>
                <label>
                    Comment: <input type="text" bind:value={commentComment} />
                </label>
                <button type="submit">Enter</button>
            </form>
        </div>
        {#each comments as comment}
            <Comment bind:username={comment.username} bind:comment={comment.comment} bind:subcomments={comment.subcomments}></Comment>
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
        font-size: small;
    }

    #log-in-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: nowrap;
        font-family: Georgia;
        font-size: medium;
    }
</style>