async function test() {
    const baseUrl = 'http://localhost:5000';
    try {
        const res = await fetch(`${baseUrl}/api/exams`);
        const exams = await res.json();

        if (exams.length > 0) {
            const first = exams[0];
            try {
                JSON.parse(first.LayoutConfig);
                console.log("LAYOUT_CHECK: VALID");
            } catch (e) {
                console.log("LAYOUT_CHECK: INVALID - " + e.message);
                console.log("BAD_VALUE:", first.LayoutConfig);
            }

            const rosterRes = await fetch(`${baseUrl}/api/exams/${first.ExamID}/roster`);
            const roster = await rosterRes.json();
            console.log(`ROSTER_COUNT: ${roster.length}`);
        } else {
            console.log("NO_EXAMS_FOUND");
        }
    } catch (err) {
        console.error("TEST_FAILED", err.message);
    }
}
test();
