//LiteLoaderScript Dev Helper
/// <reference path="c:\Users\Administrator\Documents/Library/JS/Api.js" /> 


//注册插件
const pluginName = `MagicWelcome`;
const pluginIntro = `A Simple Welcome`;
const pluginVersion = [1,0,0];
const pluginOtherInfo = JSON.parse(
    {
        "ps":"This is one of my tryouts!",
        "github repository url":""
    }
);
ll.registerPlugin(pluginName, pluginIntro, pluginVersion, pluginOtherInfo);

//初始化配置文件
var conf = new JsonConfigFile(`.\\plugins\\MagicWelcome\\config.json`, JSON.stringify(
    {
        "enabled": true,
        "joinMessage": "§b欢迎玩家§l§6{player}§r§b加入§d§lMC§r§b服务器！",
        "messageType": 0
    }
));
// conf.init(`enabled`, 1);
// conf.init(`joinMessage`, `欢迎玩家{player}加入服务器！`);
// conf.init(`messageType`, 0);

let enabled = conf.get(`enabled`);
let joinMessage = conf.get(`joinMessage`);
let messageType = conf.get(`messageType`);

const messageChoice = [0,1,2];

function setJoinGUI(player, enabled_boolean){
    let fm = mc.newCustomForm();
    fm.setTitle(`入服欢迎设置`);
    fm.addSwitch(`入服欢迎开关`, enabled_boolean);
    fm.addInput("入服欢迎内容\n提示：{player}表示玩家ID",`${joinMessage}`, `${joinMessage}`);
    fm.addDropdown(`入服欢迎显示方式`, [`聊天区`,`物品栏上方`,`屏幕上方（类似成就显示）`], messageType);
    player.sendForm(fm, (player, data) => {
        if (data == null) return
        enabled = data[0];
        joinMessage = data[1];
        messageType = data[2];
        conf.set(`enabled`, enabled);
        conf.set(`joinMessage`, joinMessage);
        conf.set(`messageType`, messageType);
        setSuccessGUI(player);
    });
}

function setSuccessGUI(player) {
    player.sendModalForm(`提示`, `您的设置已保存！`, `预览（仅自己可见）`, `确定`, (pl, result) => {
        if (result == true) {
            if (messageType == 0) {
                pl.tell(joinMessage.replace(/{player}/g, pl.name), 1);
            } else if (messageType == 1) {
                pl.tell(joinMessage.replace(/{player}/g, pl.name), 5);
            } else if (messageType == 2) {
                pl.sendToast(`欢迎！`, joinMessage.replace(/{player}/g, pl.name));
            }
        }
    });
}

function noPermissionGUI(player) {
    player.sendModalForm(`提示`, `您无权更改入服欢迎设置！`, `确定`, `取消`, (player, result) => {
        return
    });
}

mc.listen(`onJoin`, (player) => {
    if (conf.get(`enabled`) == true) {
        if (messageType == 0) {
            mc.broadcast(joinMessage.replace(/{player}/g, player.name), 1);
        } else if (messageType == 1) {
            mc.broadcast(joinMessage.replace(/{player}/g, player.name), 5);
        } else if (messageType == 2) {
            player.sendToast(`欢迎！`, joinMessage.replace(/{player}/g, player.name));
        }
    }
});

mc.listen(`onServerStarted`, () => {
    if (ll.requireVersion(2, 1, 3) == false) {
        logger.warn(`LiteLoader版本过低，顶部入服提示可能无法使用！`);
    }
    logger.setTitle(`MagicWelcome`);
    logger.info(`MagicWelcome loaded!`);
});

let setJoinCMD = mc.regPlayerCmd(`setjoin`, `设置入服消息`, (pl, args) => {
    if (pl.isOP() == true) {
        if (enabled == 1) {
            let enabled_boolean = true;
            setJoinGUI(pl, enabled_boolean);
        } else {
            let enabled_boolean = false;
            setJoinGUI(pl, enabled_boolean);
        }
    } else {
        noPermissionGUI(pl);
    }
}, 0);