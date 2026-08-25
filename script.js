// =====================================
// SUPABASE
// =====================================

const SUPABASE_URL =
    "https://mjeefjkccqbkiievuing.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tzT01tFt9k8nIXNyhCLdFw_uxFa8ts-";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================
// ADMIN PASSWORD
// =====================================

let ADMIN_PASSWORD =
    localStorage.getItem("adminPassword") || "12345678";


// =====================================
// HOME PAGE
// =====================================

const adminBtn = document.getElementById("adminBtn");
const teamBtn = document.getElementById("teamBtn");

if (adminBtn) {
    adminBtn.addEventListener("click", function () {
        window.location.href = "admin-login.html";
    });
}

if (teamBtn) {
    teamBtn.addEventListener("click", function () {
        window.location.href = "team.html";
    });
}


// =====================================
// ADMIN LOGIN
// =====================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const password =
                document.getElementById("adminPassword").value;

            const message =
                document.getElementById("loginMessage");

            message.textContent = "Checking password...";

            if (password === ADMIN_PASSWORD) {

                message.textContent =
                    "Login successful!";

                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );

                setTimeout(function () {

                    window.location.href =
                        "admin.html";

                }, 500);

            } else {

                message.textContent =
                    "Invalid password.";

            }
        }
    );
}


// =====================================
// CHANGE ADMIN PASSWORD
// =====================================

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        function () {

            const oldPassword =
                document.getElementById("oldPassword").value;

            const newPassword =
                document.getElementById("newPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message =
                document.getElementById(
                    "changePasswordMessage"
                );

            if (
                !oldPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                message.textContent =
                    "Please fill all fields.";

                return;
            }

            if (oldPassword !== ADMIN_PASSWORD) {

                message.textContent =
                    "Old password is incorrect.";

                return;
            }

            if (newPassword.length < 6) {

                message.textContent =
                    "New password must be at least 6 characters.";

                return;
            }

            if (newPassword !== confirmPassword) {

                message.textContent =
                    "New passwords do not match.";

                return;
            }

            if (newPassword === oldPassword) {

                message.textContent =
                    "New password must be different from old password.";

                return;
            }

            ADMIN_PASSWORD = newPassword;

            localStorage.setItem(
                "adminPassword",
                newPassword
            );

            message.textContent =
                "Password changed successfully!";

            document.getElementById("oldPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        }
    );
}


// =====================================
// ADMIN DASHBOARD
// =====================================

const expenseForm =
    document.getElementById("expenseForm");

const adminExpenseTableBody =
    document.getElementById(
        "adminExpenseTableBody"
    );

const logoutBtn =
    document.getElementById("logoutBtn");


// =====================================
// LOAD ADMIN EXPENSES
// =====================================

async function loadExpenses() {

    if (!adminExpenseTableBody) return;

    const { data, error } =
        await db
            .from("expenses")
            .select("*")
            .order("date", {
                ascending: true
            });

    if (error) {

        console.error(
            "Error loading expenses:",
            error
        );

        return;
    }

    adminExpenseTableBody.innerHTML = "";

    let totalExpense = 0;
    let totalBalance = 0;

    data.forEach(function (expense) {

        totalExpense +=
            Number(expense.amount) || 0;

        totalBalance +=
            Number(expense.balance_amount) || 0;

    });


    // =====================================
    // GROUP BY DATE
    // =====================================

    const groupedExpenses = {};

    data.forEach(function (expense) {

        if (!groupedExpenses[expense.date]) {

            groupedExpenses[expense.date] = [];

        }

        groupedExpenses[expense.date].push(expense);

    });


    // =====================================
    // DISPLAY ADMIN EXPENSES
    // =====================================

    Object.keys(groupedExpenses).forEach(
        function (date) {

            const expensesForDay =
                groupedExpenses[date];

            const dailyTotal =
                expensesForDay.reduce(
                    function (sum, expense) {

                        return sum +
                            (Number(expense.amount) || 0);

                    },
                    0
                );

            const formattedDate =
                new Date(
                    date + "T00:00:00"
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            // DAILY HEADER

            const dateRow =
                document.createElement("tr");

            dateRow.innerHTML = `
                <td
                    colspan="7"
                    class="daily-expense-date"
                >

                    <div>
                        Daily Expenses - ${formattedDate}
                    </div>

                    <strong>
                        Total Expenses:
                        ₹${dailyTotal.toFixed(2)}
                    </strong>

                </td>
            `;

            adminExpenseTableBody.appendChild(dateRow);


            // EXPENSE ROWS

            expensesForDay.forEach(
                function (expense) {

                    const row =
                        document.createElement("tr");

                    const tableDate =
                        new Date(
                            expense.date +
                            "T00:00:00"
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                    row.innerHTML = `

                        <td>
                            ${tableDate}
                        </td>

                        <td>
                            ${escapeHTML(expense.purpose)}
                        </td>

                        <td>
                            ₹${Number(
                                expense.amount
                            ).toFixed(2)}
                        </td>

                        <td>
                            ${escapeHTML(expense.paid_by)}
                        </td>

                        <td>
                            ₹${Number(
                                expense.balance_amount
                            ).toFixed(2)}
                        </td>

                        <td>
                            ₹${dailyTotal.toFixed(2)}
                        </td>

                        <td>

                            <button
                                onclick="editExpense('${expense.id}')"
                            >
                                Edit
                            </button>

                            <button
                                onclick="deleteExpense('${expense.id}')"
                            >
                                Delete
                            </button>

                        </td>

                    `;

                    adminExpenseTableBody.appendChild(row);

                }
            );

        }
    );


    // =====================================
    // SUMMARY
    // =====================================

    const totalExpenseElement =
        document.getElementById("totalExpense");

    const totalBalanceElement =
        document.getElementById("totalBalance");

    const totalEntriesElement =
        document.getElementById("totalEntries");

    if (totalExpenseElement) {

        totalExpenseElement.textContent =
            "₹" + totalExpense.toFixed(2);

    }

    if (totalBalanceElement) {

        totalBalanceElement.textContent =
            "₹" + totalBalance.toFixed(2);

    }

    if (totalEntriesElement) {

        totalEntriesElement.textContent =
            data.length;

    }
}


// =====================================
// SAFE HTML
// =====================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// ADD EXPENSE
// =====================================

if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const date =
                document.getElementById("expenseDate").value;

            const purpose =
                document.getElementById("purpose")
                    .value.trim();

            const amount =
                document.getElementById("amount").value;

            const paidBy =
                document.getElementById("paidBy")
                    .value.trim();

            const balanceAmount =
                document.getElementById(
                    "balanceAmount"
                ).value;

            const message =
                document.getElementById(
                    "expenseMessage"
                );

            message.textContent =
                "Adding expense...";

            if (
                !date ||
                !purpose ||
                !amount ||
                !paidBy ||
                !balanceAmount
            ) {

                message.textContent =
                    "Please fill all fields.";

                return;
            }

            const { data, error } =
                await db
                    .from("expenses")
                    .insert([
                        {
                            date: date,
                            purpose: purpose,
                            amount: Number(amount),
                            paid_by: paidBy,
                            balance_amount:
                                Number(balanceAmount)
                        }
                    ])
                    .select();

            if (error) {

                console.error(
                    "SUPABASE INSERT ERROR:",
                    error
                );

                message.textContent =
                    "Failed to add expense: " +
                    error.message;

                return;
            }

            console.log(
                "Expense added:",
                data
            );

            message.textContent =
                "Expense added successfully!";

            expenseForm.reset();

            await loadExpenses();
        }
    );
}


// =====================================
// DELETE EXPENSE
// =====================================

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );

    if (!confirmDelete) return;

    const { error } =
        await db
            .from("expenses")
            .delete()
            .eq("id", id);

    if (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete expense: " +
            error.message
        );

        return;
    }

    alert(
        "Expense deleted successfully!"
    );

    await loadExpenses();
}


// =====================================
// EDIT EXPENSE
// =====================================

async function editExpense(id) {

    const {
        data,
        error: fetchError
    } =
        await db
            .from("expenses")
            .select("*")
            .eq("id", id)
            .single();

    if (fetchError) {

        console.error(
            "FETCH EXPENSE ERROR:",
            fetchError
        );

        alert(
            "Unable to load expense: " +
            fetchError.message
        );

        return;
    }

    if (!data) {

        alert("Expense not found.");

        return;
    }


    const newDate =
        prompt(
            "Enter date (YYYY-MM-DD):",
            data.date
        );

    if (newDate === null) return;


    const newPurpose =
        prompt(
            "Enter purpose:",
            data.purpose
        );

    if (newPurpose === null) return;


    const newAmount =
        prompt(
            "Enter amount:",
            data.amount
        );

    if (newAmount === null) return;


    const newPaidBy =
        prompt(
            "Enter paid by:",
            data.paid_by
        );

    if (newPaidBy === null) return;


    const newBalanceAmount =
        prompt(
            "Enter balance amount:",
            data.balance_amount
        );

    if (newBalanceAmount === null) return;


    if (
        !newDate.trim() ||
        !newPurpose.trim() ||
        !newAmount.trim() ||
        !newPaidBy.trim() ||
        !newBalanceAmount.trim()
    ) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    if (
        isNaN(Number(newAmount)) ||
        isNaN(Number(newBalanceAmount))
    ) {

        alert(
            "Amount and balance amount must be numbers."
        );

        return;
    }


    const updatedExpense = {

        date: newDate.trim(),

        purpose: newPurpose.trim(),

        amount: Number(newAmount),

        paid_by: newPaidBy.trim(),

        balance_amount:
            Number(newBalanceAmount)

    };


    const {
        data: updatedData,
        error: updateError
    } =
        await db
            .from("expenses")
            .update(updatedExpense)
            .eq("id", id)
            .select();

    if (updateError) {

        console.error(
            "SUPABASE UPDATE ERROR:",
            updateError
        );

        alert(
            "Unable to edit expense:\n\n" +
            updateError.message
        );

        return;
    }

    console.log(
        "Expense updated successfully:",
        updatedData
    );

    alert(
        "Expense updated successfully!"
    );

    await loadExpenses();
}


// =====================================
// LOGOUT
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            window.location.href =
                "index.html";

        }
    );
}


// =====================================
// TEAM MEMBER DASHBOARD
// =====================================

const teamExpenseTableBody =
    document.getElementById(
        "expenseTableBody"
    );


async function loadTeamExpenses() {

    if (!teamExpenseTableBody) return;

    const { data, error } =
        await db
            .from("expenses")
            .select("*")
            .order("date", {
                ascending: true
            });

    if (error) {

        console.error(
            "Error loading team expenses:",
            error
        );

        return;
    }

    teamExpenseTableBody.innerHTML = "";

    // =====================================
    // TEAM SUMMARY TOTALS
    // =====================================

    let totalExpense = 0;

    data.forEach(function (expense) {

        totalExpense +=
            Number(expense.amount) || 0;

    });

    const teamTotalExpense =
        document.getElementById(
            "teamTotalExpense"
        );

    const teamTotalEntries =
        document.getElementById(
            "teamTotalEntries"
        );

    if (teamTotalExpense) {

        teamTotalExpense.textContent =
            "₹" + totalExpense.toFixed(2);

    }

    if (teamTotalEntries) {

        teamTotalEntries.textContent =
            data.length;

    }


    // =====================================
    // GROUP BY DATE
    // =====================================

    const groupedExpenses = {};

    data.forEach(function (expense) {

        if (!groupedExpenses[expense.date]) {

            groupedExpenses[expense.date] = [];

        }

        groupedExpenses[expense.date].push(expense);

    });


    // =====================================
    // DISPLAY TEAM EXPENSES
    // =====================================

    Object.keys(groupedExpenses).forEach(
        function (date) {

            const expensesForDay =
                groupedExpenses[date];

            const dailyTotal =
                expensesForDay.reduce(
                    function (sum, expense) {

                        return sum +
                            (Number(expense.amount) || 0);

                    },
                    0
                );

            const formattedDate =
                new Date(
                    date + "T00:00:00"
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            // =================================
            // DAILY HEADER
            // =================================

            const dateRow =
                document.createElement("tr");

            dateRow.innerHTML = `
                <td
                    colspan="5"
                    class="daily-expense-date"
                >

                    <div>
                        Daily Expenses - ${formattedDate}
                    </div>

                    <strong>
                        Total Expenses:
                        ₹${dailyTotal.toFixed(2)}
                    </strong>

                </td>
            `;

            teamExpenseTableBody.appendChild(
                dateRow
            );


            // =================================
            // EXPENSE ROWS
            // =================================

            expensesForDay.forEach(
                function (expense) {

                    const row =
                        document.createElement("tr");

                    const tableDate =
                        new Date(
                            expense.date +
                            "T00:00:00"
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                    row.innerHTML = `

                        <td>
                            ${tableDate}
                        </td>

                        <td>
                            ${escapeHTML(
                                expense.purpose
                            )}
                        </td>

                        <td>
                            ₹${Number(
                                expense.amount
                            ).toFixed(2)}
                        </td>

                        <td>
                            ${escapeHTML(
                                expense.paid_by
                            )}
                        </td>

                        <td>
                            ₹${Number(
                                expense.balance_amount
                            ).toFixed(2)}
                        </td>

                    `;

                    teamExpenseTableBody.appendChild(
                        row
                    );

                }
            );

        }
    );

}

// =====================================
// PDF DOWNLOAD
// =====================================

async function downloadExpensesPDF() {

    try {

        const button =
            document.getElementById(
                "downloadPdfBtn"
            );

        if (button) {

            button.disabled = true;

            button.textContent =
                "Creating PDF...";

        }


        // Get data directly from Supabase

        const {
            data,
            error
        } =
            await db
                .from("expenses")
                .select("*")
                .order("date", {
                    ascending: true
                });


        if (error) {

            alert(
                "Unable to get expenses:\n\n" +
                error.message
            );

            return;
        }


        if (!data || data.length === 0) {

            alert(
                "There are no expenses to download."
            );

            return;
        }


        // TOTALS

        let totalExpense = 0;
        let totalBalance = 0;

        data.forEach(function (expense) {

            totalExpense +=
                Number(expense.amount) || 0;

            totalBalance +=
                Number(expense.balance_amount) || 0;

        });


        // jsPDF

        const jsPDF =
            window.jspdf.jsPDF;

        const doc =
            new jsPDF();


        // TITLE

        doc.setFontSize(20);

        doc.text(
            "Expense Tracker",
            14,
            18
        );

        doc.setFontSize(11);

        doc.text(
            "Expense Report",
            14,
            26
        );

        doc.text(
            "Generated: " +
            new Date().toLocaleDateString("en-IN"),
            14,
            33
        );


        // SUMMARY

        doc.setFontSize(12);

        doc.text(
            "Total Expenses: Rs. " +
            totalExpense.toFixed(2),
            14,
            44
        );

        doc.text(
            "Total Balance: Rs. " +
            totalBalance.toFixed(2),
            14,
            51
        );

        doc.text(
            "Total Entries: " +
            data.length,
            14,
            58
        );


        // TABLE

        const tableData =
            data.map(function (expense) {

                const formattedDate =
                    new Date(
                        expense.date +
                        "T00:00:00"
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

                return [

                    formattedDate,

                    expense.purpose || "",

                    "Rs. " +
                    Number(
                        expense.amount
                    ).toFixed(2),

                    expense.paid_by || "",

                    "Rs. " +
                    Number(
                        expense.balance_amount
                    ).toFixed(2)

                ];

            });


        doc.autoTable({

            startY: 66,

            head: [[
                "Date",
                "Purpose",
                "Amount",
                "Paid By",
                "Balance"
            ]],

            body: tableData,

            theme: "grid",

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            headStyles: {
                fontSize: 9
            }

        });


        const finalY =
            doc.lastAutoTable.finalY + 12;

        doc.setFontSize(12);

        doc.text(
            "Total Expenses: Rs. " +
            totalExpense.toFixed(2),
            14,
            finalY
        );

        doc.text(
            "Total Balance: Rs. " +
            totalBalance.toFixed(2),
            14,
            finalY + 8
        );


        // =====================================
        // MOBILE FRIENDLY DOWNLOAD
        // =====================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        const fileName =
            "Expense-Report-" +
            today +
            ".pdf";


        // Create PDF blob

        const pdfBlob =
            doc.output("blob");

        const pdfUrl =
            URL.createObjectURL(pdfBlob);


        // Mobile browsers handle opening the PDF
        // more reliably than forced download.

        const newWindow =
            window.open(
                pdfUrl,
                "_blank"
            );


        // Desktop fallback

        if (!newWindow) {

            const link =
                document.createElement("a");

            link.href = pdfUrl;

            link.download = fileName;

            link.target = "_blank";

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        }


        setTimeout(function () {

            URL.revokeObjectURL(pdfUrl);

        }, 60000);


    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );

        alert(
            "Unable to create PDF:\n\n" +
            error.message
        );

    } finally {

        const button =
            document.getElementById(
                "downloadPdfBtn"
            );

        if (button) {

            button.disabled = false;

            button.textContent =
                "📄 Download PDF";

        }

    }
}


// =====================================
// PDF BUTTON
// =====================================

function setupPDFButton() {

    let button =
        document.getElementById(
            "downloadPdfBtn"
        );


    // If button already exists

    if (button) {

        button.addEventListener(
            "click",
            downloadExpensesPDF
        );

        return;
    }


    // Team page doesn't have a button,
    // so create one.

    if (teamExpenseTableBody) {

        const container =
            document.querySelector(
                ".dashboard-container"
            );

        if (!container) return;


        button =
            document.createElement("button");

        button.id =
            "downloadPdfBtn";

        button.type =
            "button";

        button.textContent =
            "📄 Download PDF";

        button.style.marginBottom =
            "20px";

        button.style.padding =
            "12px 18px";

        button.style.border =
            "none";

        button.style.borderRadius =
            "8px";

        button.style.background =
            "#4f46e5";

        button.style.color =
            "white";

        button.style.fontSize =
            "15px";

        button.style.fontWeight =
            "600";

        button.style.cursor =
            "pointer";


        button.addEventListener(
            "click",
            downloadExpensesPDF
        );


        container.insertBefore(
            button,
            container.querySelector(
                ".table-container"
            )
        );

    }
}


// =====================================
// START
// =====================================

if (adminExpenseTableBody) {

    loadExpenses();

}

if (teamExpenseTableBody) {

    loadTeamExpenses();

}

setupPDFButton();