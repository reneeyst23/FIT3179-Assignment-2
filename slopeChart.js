fetch('https://raw.githubusercontent.com/reneeyst23/FIT3179-Assignment-2/refs/heads/main/data/death_sex_ethnic_state.csv')
    .then(response => response.text())
    .then(csvText => {
        let parsedData = parseCSV(csvText);
        console.log("Parsed CSV Data:", parsedData);

        // Apply filter
        document.getElementById('ethnicityFilter').addEventListener('change', function() {
            const selectedEthnicity = this.value;

            var filteredData = parsedData.filter(d => d.ethnicity === selectedEthnicity);

            var data = transformData(filteredData);
            console.log("Transformed Data:", data);

            var leftCategories = JSC.sortBy(data, '2015') 
                    .reverse() 
                    .map(function(v) { 
                        return v.state; 
                    }), 
                rightCategories = JSC.sortBy(data, '2022') 
                    .reverse() 
                    .map(function(v) { 
                        return v.state; 
                    }); 

            var test = JSC.Chart('test', { 
                annotations: [ 
                    {  
                    label_style_fontSize: 14, 
                    position: 'top', 
                    margin_bottom: 6 
                    } 
                ], 
                chartArea_clipContent: false, 
                legend_visible: false, 
                defaultAxis_defaultTick: { 
                    gridLine_visible: false, 
                    line_visible: false
                }, 
                xAxis: { 
                    defaultTick: { enabled: false, padding: -5 }, 
                    orientation: 'opposite'
                }, 
                yAxis: [ 
                    { 
                        id: 'y1', 
                        categories: leftCategories, 
                        scale: { 
                            range: [ 
                                -0.5, 
                                leftCategories.length - 0.5 
                            ], 
                            invert: true
                        } 
                    }, 
                    { 
                        id: 'y2', 
                        categories: rightCategories, 
                        defaultTick: { 
                            gridLine_visible: false, 
                            line_visible: false
                        }, 
                        scale: { 
                            range: [ 
                                -0.5, 
                                rightCategories.length - 0.5 
                            ], 
                            invert: true
                        }, 
                        orientation: 'opposite'
                    } 
                ], 
                defaultSeries: { 
                    color: '#5988ef', 
                    /* First and last points have y axis ticks, which enables highlighting on tick hover. */
                    firstPoint_yAxisTick: { 
                    /* Make it use the point color. */
                        label_color: '%color'
                    }, 
                    lastPoint_yAxisTick: { 
                        axisId: 'y2', 
                        label_color: '%color'
                    }, 
                    defaultPoint: { 
                        marker: { 
                            type: 'circle', 
                            outline_width: 0 
                        }, 
                        /* Makes a tick appear on the x axis at the point position. (the 1990 and 2000 ticks at the top) */
                        xAxisTick: {}, 
                        hoverAction: 'highlightSeries', 
                        tooltip: 
                            'CO₂ emissions in %state, %xValue<br><b>%zValue Mt</b>'
                    } 
                }, 
                series: getSeries(data) 
            });
            
            function getSeries(data) { 
                return data.map(function(v) { 
                    var state = v.state, 
                    leftI = leftCategories.indexOf(state), 
                    rightI = rightCategories.indexOf(state); 
                    return { 
                        color: 
                            leftI < rightI 
                            ? palette[0] 
                            : leftI > rightI 
                            ? palette[1] 
                            : palette[2], 
                        points: [ 
                            { 
                                x: 2015, 
                                y: leftI, 
                                z: v[2015], 
                                attributes_state: state 
                            }, 
                            { 
                                x: 2022, 
                                y: rightI, 
                                z: v[2022], 
                                attributes_state: state 
                            } 
                        ] 
                    }; 
                }); 
            } 
        });
        document.getElementById('ethnicityFilter').dispatchEvent(new Event('change'));       
    })

var palette = ['#4CAF50', '#FF5722', '#BDBDBD']; 
  
function getSeries(data) { 
    return data.map(function(v) { 
        var country = v.country, 
        leftI = leftCategories.indexOf(country), 
        rightI = rightCategories.indexOf(country); 
        return { 
            color: 
                leftI < rightI 
                ? palette[0] 
                : leftI > rightI 
                ? palette[1] 
                : palette[2], 
            points: [ 
                { 
                    x: 1990, 
                    y: leftI, 
                    z: v[1990], 
                    attributes_country: country 
                }, 
                { 
                    x: 2000, 
                    y: rightI, 
                    z: v[2020], 
                    attributes_country: country 
                } 
            ] 
        }; 
    }); 
} 

function parseCSV(text) {
    const rows = text.split('\n').slice(1); 
    return rows.map(row => {
        const [state, date, sex, ethnicity, abs] = row.split(',');

        // Edit date
        const [day, month, year] = date.split('/').map(num => parseInt(num.trim()));
        const parsedDate = new Date(year, month - 1, day);

        return {
            state: state.trim(),
            sex: sex.trim(),
            ethnicity: ethnicity.trim(),
            parsed_date: parsedDate,
            year: parsedDate.getFullYear(),
            abs: parseInt(abs.trim())
        };
    });
}

function transformData(data) {
    // Create an object to store results
    const result = [];

    // Group data by state and ethnicity for 2015 and 2020
    const groupedData = data.reduce((acc, row) => {
        const { state, year, abs, ethnicity } = row;

        if (year === 2015 || year === 2022) {
            if (!acc[state]) {
                acc[state] = {};
            }

            if (!acc[state][ethnicity]) {
                acc[state][ethnicity] = { '2015': 0, '2022': 0 };
            }

            // Sum the 'abs' values for the specific year
            acc[state][ethnicity][year] += abs;
        }

        return acc;
    }, {});

    // Now, map the grouped data into the desired structure
    for (const state in groupedData) {
        for (const ethnicity in groupedData[state]) {
            result.push({
                state: state,
                ethnicity: ethnicity,
                '2015': groupedData[state][ethnicity]['2015'],
                '2022': groupedData[state][ethnicity]['2022']
            });
        }
    }
    return result;
}