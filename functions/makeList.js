const {List, Image} = require('actions-on-google');
const rkuSchools = require('./schools');

let mList = new List({
    title: 'Bachelor Degrees',
    items: {
        'ce': {
            synonyms: ['comp engg'],
            title: 'Computer Engineering',
            description: 'Duration: 4yrs',
            image: new Image({
                url: 'https://www.soe.rku.ac.in/images/courses/btech-computer-engineering.png',
                alt: 'computer engg',
            }),
        },
        'me': {
            synonyms: ['mech engg'],
            title: 'Mechanical Engineering',
            description: 'Duration: 4yrs',
            image: new Image({
                url: 'https://www.soe.rku.ac.in/images/courses/btech-mechanical-engineering.png',
                alt: 'mech engg',
            }),
        },
    },
});

// console.log(mList['inputValueData']['listSelect']['items'][0]);

/**
 * @param {string} schoolName - name of the school
 * @param {string} degType - type of degree
 * @return {number|List} - either list of 0 for not found
 */
function showAllSchoolDegrees(schoolName, degType='bach') {
    if (degType !== 'both') {
        // console.log(rkuSchools[schoolName][degType]);
        let res = rkuSchools.rkuSchools[schoolName][degType];
        // console.log(res);
        let myDeg = {};
        for (let x in res) {
            // console.log(res[x]['name']);
            myDeg[x] = {
                synonyms: [res[x]['name']],
                title: res[x]['name'],
                description: res[x]['description'],
                image: new Image({
                    url: 'https://www.soe.rku.ac.in/images/courses/btech-computer-engineering.png',
                    alt: res[x]['name'],
                }),
            };
        }
        // console.log(myDeg);
        // console.log(myDeg['ce']);
        return new List({
            title: 'Bachelors Degree',
            items: myDeg,
        });
    } else {
        // console.log(rkuSchools[schoolName].bach);
        // console.log(rkuSchools[schoolName].masters);

    }
    return 0;

}
let cList = showAllSchoolDegrees('soe');
console.log(mList['inputValueData']['listSelect']['items'][1]);
console.log(cList['inputValueData']['listSelect']['items'][1]);
