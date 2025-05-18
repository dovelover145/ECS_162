<script lang="ts">
    let {_id = "",                  // Contains the comment ID
        username = $bindable(""),   // Contains the username of the original commenter
        comment = $bindable(""),    // Contains the original comment
        } = $props();

    const moderatorUsername = "moderator@hw3.com"
    const deletedCommentMessage = "COMMENT REMOVED BY MODERATOR!"; // This is what replaces deleted comments

    async function deleteComment(event: Event) {
        event.preventDefault();
        try {
            const resp = await fetch("http://localhost:8000/delete_comment", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({_id: _id, comment: deletedCommentMessage})
            });
            if (!resp.ok) {
                throw new Error("Failed to delete the comment");
            }
            const respObj = await resp.json();
            if (respObj.valid) {
                comment = deletedCommentMessage;
            } else {
                throw new Error("Failed to delete the comment");
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "Something went wrong while deleting the comment");
        }
    }
</script>

<div id="comment-container">
    <p>{username}: {comment}</p>
    {#if username === moderatorUsername && comment != deletedCommentMessage} <!-- Only a moderator can remove a comment (that hasn't already been removed) -->
        <button onclick={deleteComment}>Delete</button>
    {/if}
</div>

<style>
    #comment-container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        font-family: Georgia;
        gap: 2.5px;
    }

    #comment-container > p {
        overflow-wrap: break-word;
        word-break: break-word;
        white-space: normal;
    }

    #comment-container > button {
        background-color: rgb(255, 0, 0);
        border-color: red;
        border-radius: 5px; /* Curvature of the button */
        color: white;
        font-family: Georgia;
        font-weight: 1000;
    }

    #comment-container > button:hover {
        background-color: rgb(180, 30, 30);
        border-color: rgb(180, 30, 30);
        cursor: pointer;
    }
</style>