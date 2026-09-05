/* =================================
   STUDYFLOW - APPLICATION LOGIC
================================= */


/* =================================
   ELEMENTS
================================= */

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const taskList = document.getElementById("task-list");
const emptyTasks = document.getElementById("empty-tasks");

const taskCount = document.getElementById("task-count");
const taskStat = document.getElementById("task-stat");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const filters = document.querySelectorAll(".filter");

const themeToggle = document.getElementById("theme-toggle");

const attendanceForm =
    document.getElementById("attendance-form");

const attendanceResult =
    document.getElementById("attendance-result");

const attendanceMessage =
    document.getElementById("attendance-message");

const attendanceFill =
    document.getElementById("attendance-fill");

const attendanceStat =
    document.getElementById("attendance-stat");

const cgpaForm =
    document.getElementById("cgpa-form");

const cgpaResult =
    document.getElementById("cgpa-result");

const cgpaMessage =
    document.getElementById("cgpa-message");

const cgpaStat =
    document.getElementById("cgpa-stat");

const timerDisplay =
    document.getElementById("timer");

const timerMode =
    document.getElementById("timer-mode");

const startTimerButton =
    document.getElementById("start-timer");

const resetTimerButton =
    document.getElementById("reset-timer");



/* =================================
   TASK MANAGEMENT
================================= */

let tasks =
    JSON.parse(
        localStorage.getItem("studyflowTasks")
    ) || [];

let currentFilter = "all";


function saveTasks() {

    localStorage.setItem(
        "studyflowTasks",
        JSON.stringify(tasks)
    );
}


function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {

        filteredTasks =
            tasks.filter(task => !task.completed);

    }

    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(task => task.completed);

    }


    if (filteredTasks.length === 0) {

        emptyTasks.style.display = "block";

    } else {

        emptyTasks.style.display = "none";
    }


    filteredTasks.forEach(task => {

        const li =
            document.createElement("li");

        li.className = "task-item";

        li.innerHTML = `
            <input
                type="checkbox"
                class="task-checkbox"
                data-id="${task.id}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark task as completed"
            >

            <span
                class="task-text ${
                    task.completed ? "completed" : ""
                }">
                ${escapeHTML(task.text)}
            </span>

            <span
                class="task-priority priority-${task.priority.toLowerCase()}">
                ${task.priority}
            </span>

            <div class="task-actions">

                <button
                    class="edit-task"
                    data-id="${task.id}"
                    aria-label="Edit task">
                    ✏️
                </button>

                <button
                    class="delete-task"
                    data-id="${task.id}"
                    aria-label="Delete task">
                    🗑️
                </button>

            </div>
        `;

        taskList.appendChild(li);
    });

    updateTaskProgress();
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* Add task */

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const text =
        taskInput.value.trim();

    const priority =
        priorityInput.value;


    if (!text) {
        return;
    }


    const newTask = {
    id: Date.now(),
    text: text,
    priority: priority,
    completed: false,
    completedAt: null
};


    tasks.push(newTask);

saveTasks();

taskInput.value = "";

priorityInput.value = "Medium";

renderTasks();

calculateProductivityScore();
});


/* Task actions */

taskList.addEventListener("click", function(event) {

    const id =
        Number(event.target.dataset.id);


    if (event.target.classList.contains("delete-task")) {

       tasks =
    tasks.filter(task => task.id !== id);

saveTasks();

renderTasks();

calculateProductivityScore();
    }


    if (event.target.classList.contains("edit-task")) {

        const task =
            tasks.find(task => task.id === id);

        if (!task) return;


        const newText =
            prompt(
                "Edit your task:",
                task.text
            );


        if (
            newText !== null &&
            newText.trim() !== ""
        ) {

            task.text =
                newText.trim();

            saveTasks();

            renderTasks();
        }
    }

});


/* Complete task */

taskList.addEventListener("change", function(event) {

    if (
        event.target.classList.contains(
            "task-checkbox"
        )
    ) {

        const id =
            Number(event.target.dataset.id);

        const task =
            tasks.find(task => task.id === id);

        if (!task) return;

        task.completed =
    event.target.checked;

saveTasks();

renderTasks();

calculateProductivityScore();
    }

});


/* Filters */

filters.forEach(filter => {

    filter.addEventListener("click", function() {

        filters.forEach(button =>
            button.classList.remove("active")
        );

        this.classList.add("active");

        currentFilter =
            this.dataset.filter;

        renderTasks();
    });

});


/* Progress */

function updateTaskProgress() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    totalCount.textContent =
        total;

    completedCount.textContent =
        completed;

    taskStat.textContent =
        total;


    taskCount.textContent =
        `${total} ${total === 1 ? "task" : "tasks"}`;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    progressPercent.textContent =
        `${percentage}%`;

    progressFill.style.width =
        `${percentage}%`;
}



/* =================================
   DARK MODE
================================= */

const savedTheme =
    localStorage.getItem(
        "studyflowTheme"
    );


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.textContent = "☀️";
}


themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark");


    const isDark =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "studyflowTheme",
        isDark ? "dark" : "light"
    );


    themeToggle.textContent =
        isDark ? "☀️" : "🌙";
});



/* =================================
   ATTENDANCE CALCULATOR
================================= */

attendanceForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const total =
            Number(
                document.getElementById(
                    "total-classes"
                ).value
            );


        const attended =
            Number(
                document.getElementById(
                    "attended-classes"
                ).value
            );


        if (
            total <= 0 ||
            attended < 0 ||
            attended > total
        ) {

            attendanceResult.textContent =
                "Invalid";

            attendanceMessage.textContent =
                "Please enter valid class numbers.";

            return;
        }


        const percentage =
            (attended / total) * 100;


        const rounded =
            percentage.toFixed(1);


        attendanceResult.textContent =
            `${rounded}%`;

        attendanceStat.textContent =
            `${rounded}%`;


        attendanceFill.style.width =
            `${Math.min(percentage, 100)}%`;


        if (percentage >= 85) {

            attendanceMessage.textContent =
                "Excellent! Your attendance is in a safe zone. 🟢";

        } else if (percentage >= 75) {

            attendanceMessage.textContent =
                "You're above the minimum, but keep attending regularly. 🟡";

        } else {

            attendanceMessage.textContent =
                "Your attendance is low. You need to attend more classes. 🔴";
        }


        localStorage.setItem(
            "studyflowAttendance",
            JSON.stringify({
                percentage: rounded
            })
        );
    }
);


/* Restore attendance */

const savedAttendance =
    JSON.parse(
        localStorage.getItem(
            "studyflowAttendance"
        )
    );


if (savedAttendance) {

    attendanceResult.textContent =
        `${savedAttendance.percentage}%`;

    attendanceStat.textContent =
        `${savedAttendance.percentage}%`;

    attendanceFill.style.width =
        `${savedAttendance.percentage}%`;
}



/* =================================
   CGPA CALCULATOR
================================= */

cgpaForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const gpas = [
            Number(
                document.getElementById("sem1").value
            ),

            Number(
                document.getElementById("sem2").value
            ),

            Number(
                document.getElementById("sem3").value
            ),

            Number(
                document.getElementById("sem4").value
            )
        ];


        const valid =
            gpas.every(
                gpa =>
                    gpa >= 0 &&
                    gpa <= 10
            );


        if (!valid) {

            cgpaResult.textContent =
                "Invalid";

            cgpaMessage.textContent =
                "GPA must be between 0 and 10.";

            return;
        }


        const cgpa =
            gpas.reduce(
                (sum, gpa) =>
                    sum + gpa,
                0
            ) / gpas.length;


        const rounded =
            cgpa.toFixed(2);


        cgpaResult.textContent =
            rounded;

        cgpaStat.textContent =
            rounded;


        if (cgpa >= 9) {

            cgpaMessage.textContent =
                "Outstanding academic performance! 🏆";

        } else if (cgpa >= 8) {

            cgpaMessage.textContent =
                "Great work! Keep pushing forward. 🌟";

        } else if (cgpa >= 7) {

            cgpaMessage.textContent =
                "Good progress. There's room to improve! 📈";

        } else {

            cgpaMessage.textContent =
                "Keep working consistently. You can improve! 💪";
        }


        localStorage.setItem(
            "studyflowCGPA",
            JSON.stringify({
                cgpa: rounded
            })
        );
       calculateProductivityScore();
    }
);


/* Restore CGPA */

const savedCGPA =
    JSON.parse(
        localStorage.getItem(
            "studyflowCGPA"
        )
    );


if (savedCGPA) {

    cgpaResult.textContent =
        savedCGPA.cgpa;

    cgpaStat.textContent =
        savedCGPA.cgpa;
}



/* =================================
   POMODORO TIMER
================================= */

let timeLeft = 25 * 60;

let timerInterval = null;

let timerRunning = false;


function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timeLeft / 60
        );

    const seconds =
        timeLeft % 60;


    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


startTimerButton.addEventListener(
    "click",
    function() {

        if (timerRunning) {

            clearInterval(
                timerInterval
            );

            timerRunning = false;

            startTimerButton.textContent =
                "▶ Resume";

            return;
        }


        timerRunning = true;

        startTimerButton.textContent =
            "⏸ Pause";


        timerInterval =
            setInterval(function() {

                if (timeLeft <= 0) {

                    clearInterval(
                        timerInterval
                    );

                    timerRunning = false;

                    timerMode.textContent =
                        "Focus session complete! 🎉";

                    startTimerButton.textContent =
                        "▶ Start";

                    return;
                }


                timeLeft--;

                updateTimerDisplay();

            }, 1000);
    }
);


resetTimerButton.addEventListener(
    "click",
    function() {

        clearInterval(
            timerInterval
        );

        timerRunning = false;

        timeLeft = 25 * 60;

        updateTimerDisplay();

        timerMode.textContent =
            "Focus time";

        startTimerButton.textContent =
            "▶ Start";
    }
);



/* =================================
   INITIALIZE
================================= */

renderTasks();

updateTimerDisplay();
/* =================================
   STUDY STREAK
================================= */

const streakStat =
    document.getElementById("streak-stat");


function updateStudyStreak() {

    const today =
        new Date().toISOString().split("T")[0];

    const savedDate =
        localStorage.getItem(
            "studyflowLastVisit"
        );

    let streak =
        Number(
            localStorage.getItem(
                "studyflowStreak"
            )
        ) || 0;


    if (!savedDate) {

        streak = 1;

    } else {

        const previous =
            new Date(savedDate);

        const current =
            new Date(today);

        const difference =
            Math.floor(
                (current - previous) /
                (1000 * 60 * 60 * 24)
            );


        if (difference === 1) {

            streak += 1;

        } else if (difference > 1) {

            streak = 1;
        }
    }


    localStorage.setItem(
        "studyflowLastVisit",
        today
    );

    localStorage.setItem(
        "studyflowStreak",
        streak
    );


    if (streakStat) {

        streakStat.textContent =
            `${streak} ${streak === 1 ? "day" : "days"}`;
    }
}


updateStudyStreak();



/* =================================
   PRODUCTIVITY SCORE
================================= */

const productivityScore =
    document.getElementById(
        "productivity-score"
    );

const productivityMessage =
    document.getElementById(
        "productivity-message"
    );


function calculateProductivityScore() {

    if (!productivityScore) {
        return;
    }


    let score = 0;


    /* TASK SCORE */

    if (tasks.length > 0) {

        const completed =
            tasks.filter(
                task => task.completed
            ).length;


        const taskPercentage =
            completed / tasks.length;


        score +=
            taskPercentage * 40;
    }


    /* ATTENDANCE SCORE */

    const attendanceData =
        JSON.parse(
            localStorage.getItem(
                "studyflowAttendance"
            )
        );


    if (attendanceData) {

        const attendance =
            Number(
                attendanceData.percentage
            );


        score +=
            Math.min(
                attendance / 100,
                1
            ) * 30;
    }


    /* CGPA SCORE */

    const cgpaData =
        JSON.parse(
            localStorage.getItem(
                "studyflowCGPA"
            )
        );


    if (cgpaData) {

        const cgpa =
            Number(
                cgpaData.cgpa
            );


        score +=
            Math.min(
                cgpa / 10,
                1
            ) * 30;
    }


    score =
        Math.round(score);


    productivityScore.textContent =
        score;


    if (score >= 90) {

        productivityMessage.textContent =
            "Outstanding! You're absolutely crushing your goals. 🏆";

    } else if (score >= 75) {

        productivityMessage.textContent =
            "Excellent progress! Keep the momentum going. 🚀";

    } else if (score >= 50) {

        productivityMessage.textContent =
            "Good start! A little consistency can take you further. 📈";

    } else {

        productivityMessage.textContent =
            "Let's get started. Small steps lead to big results. 🌱";
    }
}


calculateProductivityScore();
