$(document).ready(function () {
    let jobData = [];
    let mainTable;

    $('#csvFileInput').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                complete: function (results) {
                    jobData = results.data.filter(row => row.work_year && row.salary_in_usd);
                    createMainTable();
                    createLineChart();
                }
            });
        }
    });

    function createMainTable() {
        const tableData = aggregateDataByWorkYear(jobData);
        mainTable = $('#mainTable').DataTable({
            data: tableData,
            columns: [
                { data: 'work_year' },
                { data: 'totalJobs' },
                { data: 'averageSalary' }
            ],
            lengthChange: false,
            paging: false,
            info: false
        });

        $('#mainTable tbody').on('click', 'tr', function () {
            const data = mainTable.row(this).data();
            showDetailTable(data.work_year);
        });
    }

    function aggregateDataByWorkYear(data) {
        const aggregatedData = {};
        data.forEach(row => {
            const work_year = row.work_year;
            const salary = row.salary_in_usd;
            if (!aggregatedData[work_year]) {
                aggregatedData[work_year] = { work_year: work_year, totalJobs: 0, totalSalary: 0, count: 0 };
            }
            aggregatedData[work_year].totalJobs += 1;
            aggregatedData[work_year].totalSalary += salary;
            aggregatedData[work_year].count += 1;
        });

        return Object.values(aggregatedData).map(item => ({
            work_year: item.work_year,
            totalJobs: item.totalJobs,
            averageSalary: '$' + (item.totalSalary / item.count).toFixed(2)
        }));
    }

    function createLineChart() {
        const labels = [2020, 2021, 2022, 2023, 2024];
        const dataPoints = [];
        const aggregatedData = aggregateDataByWorkYear(jobData);

        const jobsByYear = labels.map(year => {
            const dataForYear = aggregatedData.find(item => item.work_year === year);
            return dataForYear ? dataForYear.totalJobs : 0;
        });

        new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Jobs',
                    data: jobsByYear,
                    borderColor: 'rgba(100, 192, 19, 1.0)',
                    backgroundColor: 'rgba(144, 240, 120, 0.2)',
                    fill: true
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'category'
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function showDetailTable(work_year) {
        const filteredData = jobData.filter(row => row.work_year === work_year);
        const aggregatedData = {};
        filteredData.forEach(row => {
            const title = row.title;
            if (!aggregatedData[title]) {
                aggregatedData[title] = 0;
            }
            aggregatedData[title] += 1;
        });

        const detailTableData = Object.entries(aggregatedData).map(([title, count]) => ({
            title: title,
            count: count
        }));

        const detailTable = $('#detailTable').DataTable({
            data: detailTableData,
            columns: [
                { data: 'title' },
                { data: 'count' }
            ],
            destroy: true
        });

        $('#detailTable').show();
    }
});
