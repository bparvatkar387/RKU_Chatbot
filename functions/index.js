// Copyright 2018, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License

'use strict';

// importing cloud debugger
const debug = require('@google-cloud/debug-agent').start({allowExpressions: true});

// Import the Dialogflow module from the Actions on Google client library.

const {dialogflow, BasicCard, Image, List, Suggestions, LinkOutSuggestion} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// adding hod information
const hod = require('./hod');

// adding school information
const rkuSchools = require('./schools');

// adding syllabus links
const syllabus = require('./syllabus');

/**
 * @param {string} dept - name of department
 * @return {(number|BasicCard)} - returns BasicCard object or exit code 0
 */
function makeHodInfoBasicCard(dept) {
    let hodinfo = hod.engg[dept];
    if (!hodinfo) {
        return 0;
    }
    return new BasicCard({
        title: hodinfo.name,
        subtitle: hodinfo.subtitle,
        text: 'Email: ' + hodinfo.email + '  ' +
            '\nOffice location: ' + hodinfo.office,
        image: new Image({
            url: hodinfo.imageUrl,
            alt: hodinfo.name,
        }),
        display: 'CROPPED',
    });
}


/**
 * @param {string} schoolName - name of the school
 * @param {string} degType - type of degree
 * @param {string} schoolBranch - name of the branch
 * @return {number} - either list of 0 for not found
 */
function makeSoeDegreeList(schoolName, degType='bach', schoolBranch='') {
    if (schoolBranch in rkuSchools[schoolName][degType]) {
        console.log(rkuSchools[schoolName][degType][schoolBranch]);
    }
    return 0;
}



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

const askMoreAssistance = (conv) => {
    conv.ask('  \nAnything else in which I can assist you?');
};

// Handle the Dialogflow intent named 'favorite color'.
// The intent collects a parameter named 'color'.
app.intent('hod of schools', (conv, {enggDepts}) => {
    // Respond with the user's lucky number and end the conversation.
    conv.ask('Here is your information');
    if (!conv.screen) {
        conv.add('No screen found to display data');
        return;
    }
    let myCard = makeHodInfoBasicCard(enggDepts);
    if (myCard) {
       conv.ask(myCard);
       askMoreAssistance(conv);
    } else {
        conv.ask('Error occurred');
    }
});

let debugInitialized = false;
let functionCompleted = false;

const myDebugStart = () => {
    debug.isReady().then(() => {
        debugInitialized = true;

        if (functionCompleted) {
            console.log('terminating function');
        }
    });
}

const myDebugStop = () => {
    functionCompleted = true;

    if (debugInitialized) {
        console.log('terminating function');
    }
}

app.intent('school branches all', (conv, {rkuSchools, degType = ''}) => {

    myDebugStart();

    // check if screen is available
    if (!conv.screen) {
        conv.ask('Please try a screen device to view the output');
        myDebugStop();
        return;
    }
    if (rkuSchools === '' && conv.data.rkuSchools === '') {
        conv.ask('Which school//college information would you like to have?');
        conv.ask(new Suggestions(['Engineering', 'Physiotherapy']));
        myDebugStart();
        return;
    } else if (conv.data.rkuSchools !== rkuSchools) {
        console.log('Setting rkuSchool from ' + conv.data.rkuSchools + ' to ' + rkuSchools);
        conv.data.rkuSchools = rkuSchools;
    }
    // for degree
    if (degType === '') {
        // eslint-disable-next-line max-len
        conv.ask('Would you like to view Bachelors Degree or Masters Degree information?');
        conv.ask(new Suggestions(['Bachelors', 'Masters']));
        myDebugStop();
        return;
    } else {
        conv.data.degType = degType.toLowerCase();
    }
    // bachelors degree
    // eslint-disable-next-line max-len
    if (degType in ['bach', 'bachelors', 'bachelor', 'ug', 'under graduation']) {
        conv.ask('Here is your information');
        if (rkuSchools === 'soe') {
            let mList = showAllSchoolDegrees('soe');
            conv.ask(mList);
            askMoreAssistance(conv);
        } else {
            // eslint-disable-next-line max-len
            conv.ask('We currently have information of Engineering branches only');

        }
    } else if (degType === 'masters') {
        conv.ask('Here is your information');
        if (rkuSchools === 'soe') {
            let mList = showAllSchoolDegrees('soe', 'masters');
            conv.ask(mList);
            askMoreAssistance(conv);
        } else {
            // eslint-disable-next-line max-len
            conv.ask('We currently have information of Engineering branches only');
        }
    }

    myDebugStop();

});

app.intent('engg branch syllabus', (conv, {enggDepts, number}) => {
    conv.ask('Here is your information');
    if (!conv.screen) {
        conv.ask('Please try a screen device to view the output');
    }
    if (syllabus.syllabus.engg.hasOwnProperty(enggDepts)) {
        conv.ask('Click the link below to view the syllabus' );
        conv.ask(new LinkOutSuggestion({
            name: 'Syllabus Link',
            url: syllabus.syllabus.engg[enggDepts][number],
        }));
        askMoreAssistance(conv);
    } else {
        // eslint-disable-next-line max-len
        conv.ask('We currently have syllabus links for Computer Engineering department only');
        askMoreAssistance(conv);
    }
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
