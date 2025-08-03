/**
 * @file Handles submission of the Interest Group Application form.
 * Submits form data to the backend via POST request.
 * Requires JWT token stored in localStorage as 'token'.
 */

/**
 * Submits the Interest Group form data via fetch to the backend API.
 * Displays an alert on success or failure.
 *
 * @param {SubmitEvent} e - The form submission event
 * @returns {Promise<void>}
 */
// @ts-ignore
document
  .getElementById("interestGroupForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    /** @type {HTMLFormElement} */
    // @ts-ignore
    const form = e.target;

    /** @type {FormData} */
    const formData = new FormData(form);

    /** @type {{
     *   Title: string,
     *   Scope: string,
     *   Description: string,
     *   MeetingFrequency: string,
     *   BudgetEstimateStart: number,
     *   BudgetEstimateEnd: number,
     *   AccessibilityConsideration: string,
     *   HealthSafetyPrecaution: string,
     *   Email: string,
     *   Equipment: string
     * }} */
    const data = {
      // @ts-ignore
      Title: formData.get("Title"),
      // @ts-ignore
      Scope: formData.get("Scope"),
      // @ts-ignore
      Description: formData.get("Description"),
      // @ts-ignore
      MeetingFrequency: formData.get("MeetingFrequency"),
      // @ts-ignore
      BudgetEstimateStart: parseFloat(formData.get("BudgetEstimateStart")),
      // @ts-ignore
      BudgetEstimateEnd: parseFloat(formData.get("BudgetEstimateEnd")),
      // @ts-ignore
      AccessibilityConsideration: formData.get("AccessibilityConsideration"),
      // @ts-ignore
      HealthSafetyPrecaution: formData.get("HealthSafetyPrecaution"),
      // @ts-ignore
      Email: formData.get("Email"),
      // @ts-ignore
      Equipment: formData.get("Equipment") || "",
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/interestGroupUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Application failed");

      alert("Application submitted successfully!");
      form.reset();
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Something went wrong while submitting.");
    }
  });
