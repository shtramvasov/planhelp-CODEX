const appState = {
    stats : {
        start_at : Math.floor(new Date().getTime() / 1000),
        totalCountCall : 0,
        avgRespTime : 0,
        ok : {},
        bad : {}
    }
}

module.exports = {
    // объект для сборки статистики
    appState,
    collectStats : (req, res, time) => {

        const logString = req.method 
            + '|' + req.baseUrl + req.route?.path
            + '|' + req.userModel?.user_id 
            // + '|' + req.headers?.authorization
            + '|' + req.originalUrl 
            + '|' + res.statusCode 
            + '|' + time;
        const statsKey = req.baseUrl + req.route?.path;
        if (+res.statusCode >= 200 && +res.statusCode <= 399) {
            if (!appState.stats.ok[statsKey]) {
                appState.stats.ok[statsKey] = { 
                    totalCountCall : 0,
                    avgRespTime : 0,
                    maxRespTime : 0,
                    minRespTime : 0,
                    lastLogs : [],
                    lastLaggyAvg : [],
                    lastLaggy5s : [],
                    lastLaggy10s : []
                }
            }
            const r = appState.stats.ok[statsKey];
            // Всего запросов
            r.totalCountCall++;
            // Последние 10 запросов
            r.lastLogs.push(logString);
            // Макс время ответа
            if (time > r.maxRespTime) {
                r.maxRespTime = time;
                // Если время ответа превысило среднее время ответа
                r.lastLaggyAvg.push(logString);
            }
            // Мин время ответа
            if (time < r.maxRespTime) {
                r.minRespTime = time;
            }
            // Дольше 5 сек
            if (time > 5000 && time < 10000) {
                r.lastLaggy5s.push(logString);
            }
            // Дольше 10 сек
            if (time > 10000) {
                r.lastLaggy10s.push(logString);
            }
            // Среднее время ответа
            r.avgRespTime = (r.avgRespTime * (r.totalCountCall - 1) + time) / r.totalCountCall;

            if (r.lastLogs.length > 10) {
                r.lastLogs.shift();
            }
            if (r.lastLaggyAvg.length > 10) {
                r.lastLaggyAvg.shift();
            }
            if (r.lastLaggy5s.length > 10) {
                r.lastLaggy5s.shift();
            }
            if (r.lastLaggy10s.length > 10) {
                r.lastLaggy10s.shift();
            }
        } else {
            // ошибки, тупо храним последние 50
            if (!appState.stats.bad[statsKey]) {
                appState.stats.bad[statsKey] = { 
                    lastLogs : []
                }
            }
            const r = appState.stats.bad[statsKey];
            r.lastLogs.push(logString);
            if (r.lastLogs.length > 50) {
                r.lastLogs.shift();
            }
        }
        appState.stats.totalCountCall++;
        appState.stats.avgRespTime = (appState.stats.avgRespTime * (appState.stats.totalCountCall - 1) + time) / appState.stats.totalCountCall;
    }
}