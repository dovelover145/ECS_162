<script lang="ts">
    let {username = $bindable(""), 
        comment = $bindable(""), 
        subcomments = $bindable([{username: "", comment: ""}])
        } = $props();

    let subcommentUsername = $state("");
    let subcommentComment = $state("");

    function postSubcomment(event: Event) {
        event.preventDefault();
        subcomments = [{username: subcommentUsername, comment: subcommentComment}, ...subcomments];
        subcommentUsername = "";
        subcommentComment = "";
    }
</script>

<div id="comment-container">
    <p id="main-comment">{username}: {comment}</p>
    {#each subcomments as subcomment}
        <p class="subcomment">{subcomment.username}: {subcomment.comment}</p>
    {/each}
    <form on:submit={postSubcomment}>
        <label>
            Username: <input type="text" bind:value={subcommentUsername} />
        </label>
        <label>
            Comment: <input type="text" bind:value={subcommentComment} />
        </label>
        <button type="submit">Enter</button>
    </form>
</div>

<style>
    #comment-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: nowrap;
        font-family: Georgia;
        margin: 20px;
    }

    .subcomment {
        font-size: smaller;
    }
</style>