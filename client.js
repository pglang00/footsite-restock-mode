const request = require('request');


const GlobalStore = [];


async function main() {
    try {
        let opts = {
            'method': 'GET',
            //other authentication measures here
        }
        await request('http://localhost:3000/monitor',opts,async(res,err,body) => {
            let data = JSON.parse(body);
            data.forEach(async(item) => {
                let restockUtcTS = new Date(item.timestamp);
                

                let now = new Date();
                let currentUtcTS = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
                
                let validTime = 5 * 60000; // replace 5 with the number of minutes since the last checkout of the sku
                
                let start = null;
                let exists = false;

                if ((new Date(currentUtcTS) - new Date(restockUtcTS.getTime() + restockUtcTS.getTimezoneOffset() * 60000) > validTime)) {
                    start = false;
                } else {
                    start = true;
                }

                
                GlobalStore.forEach(element => {
                    if (element.sku == item.sku && element.site == item.site) {
                        exists = true;
                        element.start = start;
                        element.timestamp = restockUtcTS;
                    }
                });
                if (!exists) {
                    GlobalStore.push({sku: item.sku, site: item.site, start: start, timestamp: restockUtcTS});
                }
 
            });
            await cleanOldStarts();            
        })
    } catch (e) {
        console.log(e);
    }
    let pollFreq = 30000; // frequency of polling in MS
    setTimeout(main, pollFreq);
}

async function cleanOldStarts() {
    GlobalStore.forEach(ts => {
        let restockUtcTS = new Date(ts.timestamp);
                
        let now = new Date();
        let currentUtcTS = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
        
        let validTime = 5 * 60000; // replace 5 with the number of minutes since the last checkout of the sku
        
        let start = null;

        if ((new Date(currentUtcTS) - new Date(restockUtcTS.getTime() + restockUtcTS.getTimezoneOffset() * 60000) > validTime)) {
            start = false;
        } else {
            start = true;
        }
        ts.start = start;
    });
    return;
}

main();
