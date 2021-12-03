const cfg = require('./config.json')
const functions = require('./functions.js')

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

on('playerConnecting', async (name, reason, deferrals) => {
    let user = GetIdentifiers(source)
    if(user.discord == 'Brak') return deferrals.done('# nie znaleziono twojego discordid!')
    deferrals.defer()
    await sleep(1)
    deferrals.update('# oczekuj, jestes sprawdzany')
    await sleep(3000)
    //console.log(user)
    if(functions.getUser(cfg.guildid, user.discord) == false) return deferrals.done('# nie znajdujesz sie na discordzie')
    deferrals.update('# znajdujesz sie na disordzie')
    await sleep(500)
    deferrals.update('# trwa sprawdzanie rang')
    await sleep(1000)
    if(functions.checkRole(cfg.guildid, user.discord, cfg.roleid) == false) return deferrals.done('# nie posiadasz whitelisty!')
    deferrals.update('# trwa tworzenie polaczenia')
    await sleep(500)
    if(functions.checkRM(user.discord) == true) {
        deferrals.update('# zweryfikowano cie z wcześniej zapisanego kodu')
        await sleep(500)
        deferrals.update('# trwa laczenie z serwerem')
        deferrals.done()
        functions.sendLog(cfg.logchannelid, true, '```STEAM: ' + user.steam + '\nIP: ' + user.ip + '\nDISCORD: ' + user.discord + '\nLICENSE: ' + user.license + '\nXBL: ' + user.xbl + '\nLIVE: ' + user.live + '```')
        functions.deleteJSON(user.discord)
        return
    }
    let code = functions.genCode()
    functions.sendVerifyCode(cfg.guildid, user.discord, code)
    functions.createJSON(user.discord, code)
    deferrals.update("# kod został przesłany!")
    await sleep(500)
    let card = '{"type":"AdaptiveCard","body":[{"type":"TextBlock","size":"ExtraLarge","weight":"Bolder","text":"Weryfikacja"},{"type":"TextBlock","text":"Podaj kod z Discorda który przesłał ci nasz bot!","wrap":true},{"type":"Input.Text","id":"password","title":"","placeholder":"000000","isRequired":true,"errorMessage":"Kod jest wymagany!"},{"type":"Input.Toggle", "title":"Zapamiętaj kod", "id":"remember"},{"type":"ActionSet","actions":[{"type":"Action.Submit","title":"POTWIERDZ","iconUrl":"https://i.imgur.com/J1c755g.png","style":"positive"}]}],"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","version":"1.2"}'
    deferrals.presentCard(card, async (data, rawData) => {
        if(functions.checkCode(user.discord, data.password) == false) {
            deferrals.done('# podany kod jest nieprawidlowy')
        } else {
            if(data.remember == 'true') updateJSON(user.discord, true)
            deferrals.update('# trwa laczenie z serwerem')
            await sleep(500)
            deferrals.done()
            functions.sendLog(cfg.logchannelid, true, '```STEAM: ' + user.steam + '\nIP: ' + user.ip + '\nDISCORD: ' + user.discord + '\nLICENSE: ' + user.license + '\nXBL: ' + user.xbl + '\nLIVE: ' + user.live + '```')
            functions.deleteJSON(user.discord)
        }
        //console.log(data, rawData)
    })
});

function GetIdentifiers(source) {
    const identifiers = {
        steam: "Brak",
        ip: "Brak",
        discord: "Brak",
        license: "Brak",
        xbl: "Brak",
        live: "Brak"
    }

    for (let i = 0; i < GetNumPlayerIdentifiers(source); i++) {
        const identifier = GetPlayerIdentifier(source, i);
        if (identifier.includes('steam:')) identifiers.steam = identifier;
        if (identifier.includes('ip:')) identifiers.ip = identifier;
        if (identifier.includes('discord:')) identifiers.discord = identifier.substring(8, identifier.length);
        if (identifier.includes('license:')) identifiers.license = identifier;
        if (identifier.includes('xbl:')) identifiers.xbl = identifier;
        if (identifier.includes('live:')) identifiers.live = identifier;
    }

    return identifiers;
}
