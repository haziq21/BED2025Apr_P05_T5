// import { getCommentAndAnalyze } from "../../services/sentimentService.js";
const apiBaseUrl2 = "http://localhost:3000";

const token2 = localStorage.getItem("token");

//see which page the user is at(my comment/all comments)
/**
 * @type {string}
 */
let page;

/**
 * @typedef {object} post
 * @property {string} Comment
 * @property {number} PostId
 * @property {number} UserId
 * @property {Date} TimeStamp
 * @property {number} ParentPostId
 * @property {string} UserName
 * @property {boolean} loginUser
 * @param {post[]} posts
 */
function renderPosts(posts) {
  const container = document.getElementById("postsContainer");
  // @ts-ignore
  container.innerHTML = "";

  // @ts-ignore
  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "post";
    div.id = `${post.PostId}`;
    div.innerHTML = `
          <h3>${post.UserName}</h3>
          <p>${post.Comment}</p>
          <button onclick="v(${post.PostId})">View Comments</button>
          ${
            post.loginUser === true
              ? `
            <button onclick="editComment(${post.PostId})">Edit</button>
            <button onclick="deleteComment(${post.PostId})">Delete</button>
            `
              : ""
          }`;

    // @ts-ignore
    container.appendChild(div);
  });
}

/**
 * @param {number} id
 */
function v(id) {
  getOtherComment(id);
}

/**
 * @param {number} id
 */
function editComment(id) {
  const postDiv = document.getElementById(`${id}`);
  if (!postDiv) return;
  // @ts-ignore
  //get the previous input
  const commentText = postDiv.querySelector("p")?.textContent || "";
  const textarea = document.getElementById("editCommentContent");
  // @ts-ignore
  //show the original comment
  textarea.value = commentText;

  // @ts-ignore
  document.getElementById("editOverlay").classList.toggle("active");
  const modal = document.getElementById("editModal");
  // @ts-ignore
  modal.classList.toggle("active");

  // @ts-ignore
  //create the btns
  const existingButtons = modal.querySelector(".modal-actions");

  if (existingButtons) existingButtons.remove();

  // Create a container div for buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "modal-actions";
  //submit btn
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.className = "submit-btn";
  buttonContainer.appendChild(submitBtn);
  submitBtn.onclick = function () {
    // @ts-ignore
    const updateContent = textarea.value.trim();
    const data = {
      Comment: updateContent,
      PostId: id,
      AnalysisStatus: "false",
    };
    console.log(data.PostId);
    updateComment(data);
  };
  //cancel btn
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Close";
  cancelBtn.className = "cancel-btn";
  buttonContainer.appendChild(cancelBtn);
  cancelBtn.onclick = function () {
    // @ts-ignore
    document.getElementById("editOverlay").classList.remove("active");
    // @ts-ignore
    modal.classList.remove("active");
  };
  // @ts-ignore
  modal.appendChild(buttonContainer);
}

/**
 * @param {{forEach: (arg0: (element: any) => void) => void;ParentPostId: number;map: (arg0: (c: any) => string) => any[];}} result
 * @param {number} postId
 */
function ViewComment(result, postId) {
  const cmt = document.getElementById(`allComments-${postId}`);
  const postDiv = document.getElementById(`${postId}`);
  if (cmt) {
    cmt.innerHTML = "";
  }

  if (!postDiv) return;

  postDiv.innerHTML += `
    <div id="allComments-${postId}">
        <div class="comments">
            ${
              // @ts-ignore
              result
                .map(
                  (/** @type {{ UserName: any; Comment: any; }} */ c) =>
                    `<p><strong>${c.UserName}:</strong> ${c.Comment}</p>`
                )
                .join("")
            }
        </div>
        <div class="comment-box">
                <textarea rows="2" placeholder="Leave a comment..." id="comment-${
                  // @ts-ignore
                  postId
                }"></textarea>
            <button onclick="addComment(${
              // @ts-ignore
              postId
            })">Comment</button>
        </div>
    </div>
  `;

  // console.log(result.Comment);
}

//close the form
function toggleModal() {
  // @ts-ignore
  document.getElementById("overlay").classList.toggle("active");
  // @ts-ignore
  document.getElementById("modal").classList.toggle("active");
}

function submitPost() {
  // @ts-ignore
  const content = document.getElementById("postContent").value.trim();

  if (content) {
    const data = {
      Comment: content,
      ParentPostId: -1,
      AnalysisStatus: "false",
    };
    toggleModal();
    // @ts-ignore
    document.getElementById("postContent").value = "";
    createComment(data);
  }
}

/**
 * @param {number} postId
 */
function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  console.log(input);
  // @ts-ignore
  const text = input.value.trim();
  if (text) {
    const data = {
      Comment: text,
      ParentPostId: postId,
    };
    // @ts-ignore
    input.value = "";
    console.log(data);
    createComment(data);
    getOtherComment(postId);
  }
}

function showAllPosts() {
  page = "all";
  getAllComment();
}

function showUserPosts() {
  page = "person";
  getUserComment();
}

/**
 * fetch APIs with token
 * @param {string} url
 * @param {Object} [options={}]
 * @param {Object.<string, string>} [options.headers]
 * @param {string} [options.method]
 * @param {string|FormData|Blob} [options.body]
 * @returns {Promise<any>}
 */
async function fetchWithToken(url, options = {}) {
  if (!token2) throw new Error("Token is missing. Please login first.");

  const defaultHeaders = {
    Authorization: `Bearer ${token2}`,
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  const res = await fetch(url, config);
  return res.json();
}

//create API
// @ts-ignore
async function createComment(data) {
  try {
    const options = {
      method: "POST",
      body: JSON.stringify(data),
    };
    const result = await fetchWithToken(`${apiBaseUrl2}/api/comment`, options);
    console.log("Create result:", result);
    showToast("Comment created successfully!");
    if (page === "all") {
      getAllComment();
    } else {
      getUserComment();
    }
    commentSentiment();
  } catch (error) {
    console.error("Error creating comment:", error);
  }
}

//GET API
// @ts-ignore
async function getAllComment() {
  try {
    const options = {
      method: "GET",
    };
    const result = await fetchWithToken(`${apiBaseUrl2}/api/comment`, options);
    console.log("Get result:", result);
    renderPosts(result);
  } catch (error) {
    console.error("Error getting comment:", error);
  }
}

//GET API
// @ts-ignore
async function getUserComment() {
  try {
    const options = {
      method: "GET",
    };
    const result = await fetchWithToken(
      `${apiBaseUrl2}/api/comment/byuser`,
      options
    );
    console.log("Get result:", result);
    renderPosts(result);
  } catch (error) {
    console.error("Error getting comment by Id:", error);
  }
}

//GET API
// @ts-ignore
async function getOtherComment(postId) {
  try {
    const options = {
      method: "GET",
    };
    const result = await fetchWithToken(
      `${apiBaseUrl2}/api/comment/getReply/${postId}`,
      options
    );
    console.log("Get result:", result);
    // showToast("Reply Comments get successfully!");
    ViewComment(result, postId);
    // return result;
  } catch (error) {
    console.error("Error getting reply comment by Id:", error);
  }
}

/**
 * @param {any} id
 */
async function deleteComment(id) {
  console.log(id);
  try {
    const options = {
      method: "DELETE",
    };
    const result = await fetchWithToken(
      `${apiBaseUrl2}/api/comment/${id}`,
      options
    );
    console.log("Delete result:", result);
    showToast("Comment delete successfully!");
    if (page === "all") {
      getAllComment();
    } else {
      getUserComment();
    }
    commentSentiment();
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

/**
 * @param {any} data
 */
async function updateComment(data) {
  try {
    const options = {
      method: "PUT",
      body: JSON.stringify(data),
    };
    const result = await fetchWithToken(`${apiBaseUrl2}/api/comment`, options);
    console.log("Update result:", result);
    showToast("Comment updated successfully!");
    if (page === "all") {
      getAllComment();
    } else {
      getUserComment();
    }
    commentSentiment();
  } catch (error) {
    console.error("Error updating comment:", error);
  }
}

getAllComment();

/**
 * @param {string | null} message
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  // @ts-ignore
  toast.textContent = message;
  // @ts-ignore
  toast.style.display = "block";

  setTimeout(() => {
    // @ts-ignore
    toast.style.display = "none";
  }, duration);
}

async function commentSentiment() {
  try {
    const options = {
      method: "GET",
    };
    const result = await fetchWithToken(`/api/sentiment`, options);
    console.log("Sentiment counts:", result);
    renderSentimentChart(result);
  } catch (error) {
    console.error("Error getting reply comment by Id:", error);
  }
}

/**
 * @type {{ destroy: () => void; } | null}
 */
let sentimentChartInstance = null;
/**
 * @param {undefined} [sentimentCount]
 */
async function renderSentimentChart(sentimentCount) {
  // @ts-ignore
  const ctx = document.getElementById("sentimentChart").getContext("2d");

  if (sentimentChartInstance) {
    sentimentChartInstance.destroy();
  }
  // @ts-ignore
  sentimentChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: sentimentCount,
          backgroundColor: ["#4CAF50", "#FFCE56", "#F44336"],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Sentiment Distribution",
          font: {
            size: 18,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (
              /** @type {{ label: string; parsed: number; chart: { _metasets: { [x: string]: { total: any; }; }; }; datasetIndex: string | number; }} */ context
            ) {
              let label = context.label || "";
              let value = context.parsed || 0;
              let total = context.chart._metasets[context.datasetIndex].total;
              let percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}
commentSentiment();
