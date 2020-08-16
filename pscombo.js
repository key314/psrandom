// 隣り合わない軸でのキャッチを許可
let allow_skip_pivot = true;
// ノーマル後の12以外でのキャッチを許可
let allow_skip_pivot_after_normal = true;
// コンボの長さ
let combo_length = 8;
// マルチプルできる技の追加回転数上限
let multiple_add_max = 0.5;
// コンボの終わりをノーマルにする
let finish_normal = true;
// 2~4ではさんだ状態からのノーマルを許可
let allow_abnormal = true;
// クラス名:bool の形で使用可能なトリックを記述
let enabled_trick = {
    Normal: false,
    Reverse: false,
    Sonic: false,
    SonicReverse: false,
    SymmetricalSonic: false,
    SymmetricalSonicReverse: false,
    Pass: false,
    PassReverse: false,
    SymmetricalPass: false,
    SymmetricalPassReverse: false,
    Charge: false,
    ChargeReverse: false,
    HalfWindmill: false,
    HalfWindmillReverse: false,
    Gunman: false,
    GunmanReverse: false,
    SymmetricalGunman: false,
    SymmetricalGunmanReverse: false,
    BackAround: false,
    BackAroundReverse: false,
    NeoBackAround: false,
    NeoBackAroundReverse: false,
    Shadow: false,
    ShadowReverse: false,
    ScissorSpin: false
};

// ペンのどこを指ではさんでいるか
const HOLD = {
    CENTER: 0,//中央
    EDGE_F: 1,//手の平側が長い
    EDGE_B: 2 //手の甲側が長い
}

// ペンと指の位置関係を表すクラス
class Position {
    constructor(fingerU, fingerD, hold) {
        this._fu = fingerU;
        this._fd = fingerD;
        this._hold = hold;
    }

    // 数字が小さい方の指番号
    get fingerU() {
        return this._fu;
    }
    // 数字が大きい方の指番号
    get fingerD() {
        return this._fd;
    }
    // ペンのどこを指ではさんでいるか
    get hold() {
        return this._hold;
    }

    // 2本の指が隣り合っているかを判定
    isSkip() {
        return (this._fd - this._fu) > 1;
    }

    // min以上max以下の整数をランダムに生成
    static rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}

class Trick {
    static notation(initPosition, endPosition) {
        return "_Trick_";
    }

    static weight(initPosition) {
        if (this.isEnabled())
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return false;
    }

    static nextPosition(initPosition) {
        return initPosition;
    }

    static getSuffix(initPosition, endPosition) {
        return "" + initPosition.fingerU + initPosition.fingerD + "-" + endPosition.fingerU + endPosition.fingerD
    }

    static getMultiple(min, max) {
        let multi = Math.floor(Math.random() * (2 * (max - min) + 1)) / 2 + min
        if (multi == min)
            return "";
        else
            return multi.toFixed(1);
    }
}
class Normal extends Trick {
    static notation(initPosition, endPosition) {
        return "_Normal_" + this.getMultiple(1, 1 + multiple_add_max);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerU == 1 && initPosition.fingerD != 0)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.Normal;
    }

    static nextPosition(initPosition) {
        if (allow_skip_pivot || allow_skip_pivot_after_normal)
            return new Position(1, Position.rand(2, 5), HOLD.CENTER);
        else
            return new Position(1, 2, HOLD.CENTER);
    }
}
// シメパスxy-1x⇒ノーマルのシメパスが省略されるやつ
class Abnormal extends Normal {
    static weight(initPosition) {
        if (this.isEnabled() && allow_abnormal && initPosition.fingerU > 1)
            return 5;
        else
            return 0;
    }
}
class Reverse extends Normal{
    static notation(initPosition, endPosition) {
        return "_Reverse_" + this.getMultiple(1, 1 + multiple_add_max);
    }

    static weight(initPosition) {
        if (this.isEnabled())
            return super.weight(initPosition) * 0.5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.Reverse;
    }

    static nextPosition(initPosition) {
        if (allow_skip_pivot || allow_skip_pivot_after_normal)
            return new Position(1, Position.rand(2, 5), HOLD.CENTER);
        else
            return new Position(1, 2, HOLD.CENTER);
    }
}
// リバース⇒シメパス1x-xyのシメパスが省略されるやつ
class AbnormalReverse extends Reverse{
    static weight(initPosition) {
        if (this.isEnabled() && allow_abnormal)
            return super.weight(initPosition);
        else
            return 0;
    }

    static nextPosition(initPosition) {
        let fu;
        if (allow_skip_pivot_after_normal)
            fu = Position.rand(2,4);
        else
            fu = 2;
        let fd;
        if (allow_skip_pivot)
            fd = Position.rand(fu, 5);
        else
            fd = fu + 1;
        return new Position(fu, fd, HOLD.CENTER);
    }
}
class Sonic extends Trick {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerU + "-_Sonic_";
        else
            return "_Sonic_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerU > 1)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.Sonic == true;
    }

    static nextPosition(initPosition) {
        let fd = initPosition.fingerU;
        let fu;
        if (allow_skip_pivot)
            fu = Position.rand(1, fd - 1);
        else
            fu = fd - 1;
        return new Position(fu, fd, HOLD.CENTER)
    }
}
class SonicReverse extends Trick {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerD + "-_SonicReverse_";
        else
            return "_SonicReverse_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerD != 5)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.SonicReverse;
    }

    static nextPosition(initPosition) {
        let fu = initPosition.fingerD;
        let fd;
        if (allow_skip_pivot)
            fd = Position.rand(fu + 1 ,5);
        else
            fd = fu + 1;
        return new Position(fu, fd, HOLD.CENTER)
    }
}
class SymmetricalSonic extends Sonic {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_Sonic_", "_SymmetricalSonic_");
    }

    static isEnabled() {
        return enabled_trick.SymmetricalSonic;
    }
}
class SymmetricalSonicReverse extends SonicReverse {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_SonicReverse_", "_SymmetricalSonicReverse_");
    }

    static isEnabled() {
        return enabled_trick.SymmetricalSonicReverse;
    }
}
class Pass extends Sonic {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_Sonic_", "_Pass_");
    }

    static isEnabled() {
        return enabled_trick.Pass;
    }
}
class PassReverse extends SonicReverse {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_SonicReverse_", "_PassReverse_");
    }

    static isEnabled() {
        return enabled_trick.PassReverse;
    }
}
class SymmetricalPass extends Pass {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_Pass_", "_SymmetricalPass_");
    }

    static isEnabled() {
        return enabled_trick.SymmetricalPass;
    }
}
class SymmetricalPassReverse extends PassReverse {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_PassReverse_", "_SymmetricalPassReverse_");
    }

    static isEnabled() {
        return enabled_trick.SymmetricalPassReverse;
    }
}
class Charge extends Trick {
    static notation(initPosition, endPosition) {
        return "_Charge_" + this.getSuffix(initPosition, endPosition);
    }

    static isEnabled() {
        return enabled_trick.Charge;
    }
}
class ChargeReverse extends Trick {
    static notation(initPosition, endPosition) {
        return "_ChargeReverse_" + this.getSuffix(initPosition, endPosition);
    }

    static isEnabled() {
        return enabled_trick.ChargeReverse;
    }
}
class HalfWindmill extends Trick {
    static notation(initPosition, endPosition) {
        return "_HalfWindmill_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.hold != HOLD.EDGE_F)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.HalfWindmill;
    }

    static nextPosition(initPosition) {
        return new Position(initPosition.fingerU, initPosition.fingerD, HOLD.EDGE_F)
    }
}
class HalfWindmillReverse extends Trick {
    static notation(initPosition, endPosition) {
        return "_HalfWindmillReverse_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.hold != HOLD.EDGE_B)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.HalfWindmillReverse;
    }

    static nextPosition(initPosition) {
        return new Position(initPosition.fingerU, initPosition.fingerD, HOLD.EDGE_B)
    }
}
class Gunman extends Trick {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerU + "-_Gunman_";
        else
            return "_Gunman_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerU > 1)
            if (initPosition.hold == HOLD.EDGE_F)
                return 5;
            else
                return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.Gunman;
    }

    static nextPosition(initPosition) {
        let fu = initPosition.fingerU;
        let fd;
        if (allow_skip_pivot)
            fd = Position.rand(fu + 1, 5);
        else
            fd = fu + 1;
        return new Position(fu, fd, HOLD.CENTER)
    }
}
class GunmanReverse extends Gunman {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_Gunman_", "_GunmanReverse_");
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerU > 1)
            if (initPosition.hold == HOLD.EDGE_B)
                return 5;
            else
                return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.GunmanReverse;
    }
}
class SymmetricalGunman extends Trick {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerD + "-_SymmetricalGunman_";
        else
            return "_SymmetricalGunman_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerD > 1)
            if (initPosition.hold == HOLD.EDGE_F)
                return 5;
            else
                return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.SymmetricalGunman;
    }

    static nextPosition(initPosition) {
        let fd = initPosition.fingerD;
        let fu;
        if (allow_skip_pivot)
            fu = Position.rand(1, fd - 1);
        else
            fu = fd - 1;
        return new Position(fu, fd, HOLD.CENTER)
    }
}
class SymmetricalGunmanReverse extends SymmetricalGunman {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerD + "-_SymmetricalGunmanReverse_";
        else
            return "_SymmetricalGunmanReverse_" + this.getSuffix(initPosition, endPosition);
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerD > 1)
            if (initPosition.hold == HOLD.EDGE_B)
                return 5;
            else
                return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.SymmetricalGunmanReverse;
    }
}
class BackAround extends Gunman {
    static notation(initPosition, endPosition) {
        if (!initPosition.isSkip() && !endPosition.isSkip())
            return initPosition.fingerU + "-_BackAround_" + this.getMultiple(1, 1 + multiple_add_max);
        else {
            let multi = this.getMultiple(1, 1 + multiple_add_max);
            if (multi != "")
                multi += " ";
            return "_BackAround_" + multi + this.getSuffix(initPosition, endPosition);
        }
    }

    static isEnabled() {
        return enabled_trick.BackAround;
    }
}
class BackAroundReverse extends BackAround {
    static notation(initPosition, endPosition) {
        return super.notation(initPosition, endPosition).replace("_BackAround_", "_BackAroundReverse_");
    }

    static isEnabled() {
        return enabled_trick.BackAroundReverse;
    }
}
class NeoBackAround extends Trick {
    static notation(initPosition, endPosition) {
        let multi = this.getMultiple(0.5, 0.5 + multiple_add_max);
        if (multi != "")
            multi += " ";
        return "_NeoBackAround_" + multi + this.getSuffix(initPosition, endPosition);
    }

    static nextPosition(initPosition) {
        let fu = Position.rand(1, 4);
        let fd;
        if (allow_skip_pivot)
            fd = Position.rand(fu + 1, 5);
        else
            fd = fu + 1;
        return new Position(fu, fd, HOLD.CENTER);
    }

    static isEnabled() {
        return enabled_trick.NeoBackAround;
    }
}
class NeoBackAroundReverse extends NeoBackAround {
    static notation(initPosition, endPosition) {
        let multi = this.getMultiple(0.5, 0.5 + multiple_add_max);
        if (multi != "")
            multi += " ";
        return "_NeoBackAroundReverse_" + multi + this.getSuffix(initPosition, endPosition);
    }

    static isEnabled() {
        return enabled_trick.NeoBackAroundReverse;
    }
}
class Shadow extends NeoBackAround {
    static notation(initPosition, endPosition) {
        let multi = this.getMultiple(1.5, 1.5 + multiple_add_max);
        if (multi != "")
            multi += " ";
        return "_Shadow_" + multi + this.getSuffix(initPosition, endPosition);
    }

    static isEnabled() {
        return enabled_trick.Shadow;
    }
}
class ShadowReverse extends NeoBackAround {
    static notation(initPosition, endPosition) {
        let multi = this.getMultiple(1.5, 1.5 + multiple_add_max);
        if (multi != "")
            multi += " ";
        return "_ShadowReverse_" + multi + this.getSuffix(initPosition, endPosition);
    }

    static isEnabled() {
        return enabled_trick.ShadowReverse;
    }
}
class ScissorSpin extends Trick {
    static notation(initPosition, endPosition) {
        let sufx = this.getSuffix(initPosition, endPosition);
        if (sufx == "23-12")
            sufx = "";
        else
            sufx = " " + sufx;
        return "_ScissorSpin_" + this.getMultiple(1, 1 + multiple_add_max) + sufx;
    }

    static weight(initPosition) {
        if (this.isEnabled() && initPosition.fingerU > 1)
            return 5;
        else
            return 0;
    }

    static isEnabled() {
        return enabled_trick.ScissorSpin;
    }

    static nextPosition(initPosition) {
        if (allow_skip_pivot)
            return new Position(1, Position.rand(2,5), HOLD.CENTER);
        else
            return new Position(1, 2, HOLD.CENTER);
    }
}

function generateCombo() {
    // 初期位置を12間で中心位置を持った状態にする
    let position;
    {
        let fu = Position.rand(1, 4);
        position = new Position(fu, fu + 1, HOLD.CENTER);
    }

    // 技候補の配列を作成
    let candidates = Array.of(
        Normal,
        Abnormal,
        Reverse,
        AbnormalReverse,
        Sonic,
        SonicReverse,
        SymmetricalSonic,
        SymmetricalSonicReverse,
        Pass,
        PassReverse,
        SymmetricalPass,
        SymmetricalPassReverse,
        Charge,
        ChargeReverse,
        HalfWindmill,
        HalfWindmillReverse,
        Gunman,
        GunmanReverse,
        SymmetricalGunman,
        SymmetricalGunmanReverse,
        BackAround,
        BackAroundReverse,
        NeoBackAround,
        NeoBackAroundReverse,
        Shadow,
        ShadowReverse,
        ScissorSpin
    );
    // ランダム選択の重み付け数値を入れる配列を作成
    let weights = Array(candidates.length);

    let result = "";
    
    for (let i = 0; i < combo_length - (finish_normal && enabled_trick.Normal)? 1 : 0; i++) {
        // 現在のpositionに対する各技候補の選出確率を判定
        let weightSum = 0;
        for (let j = 0; j < candidates.length; j++) {
            weights[j] = candidates[j].weight(position);
            weightSum += weights[j];
        }

        if (weightSum == 0)
            break;

        // 技候補からランダムに選出
        let r = Math.random() * weightSum;
        for (let j = 0; j < weights.length; j++) {
            if(weights[j] >= r) {
                let nextpos = candidates[j].nextPosition(position);
                result += candidates[j].notation(position, nextpos) + "=>";
                position = nextpos;
                break;
            }
            r -= weights[j];
        }
    }

    if (finish_normal && enabled_trick.Normal)
        result += Normal.notation(null, null);
    else
        result = result.slice(0, -2);

    return result;
}

// TODO: 外部ファイルに出したい
const KATAKANA_DICT = {
    "=>": "⇒",
    "_Normal_": "ノーマル",
    "_Reverse_": "リバース",
    "_Sonic_": "ソニック",
    "_SonicReverse_": "ソニックリバース",
    "_SymmetricalSonic_": "シメトリカルソニック",
    "_SymmetricalSonicReverse_": "シメトリカルソニックリバース",
    "_Pass_": "パス",
    "_PassReverse_": "パスリバース",
    "_SymmetricalPass_": "シメトリカルパス",
    "_SymmetricalPassReverse_": "シメトリカルパスリバース",
    "_Charge_": "チャージ",
    "_ChargeReverse_": "チャージリバース",
    "_HalfWindmill_": "ハーフウィンドミル",
    "_HalfWindmillReverse_": "ハーフウィンドミルリバース",
    "_Gunman_": "ガンマン",
    "_GunmanReverse_": "ガンマンリバース",
    "_SymmetricalGunman_": "シメトリカルガンマン",
    "_SymmetricalGunmanReverse_": "シメトリカルガンマンリバース",
    "_BackAround_": "バックアラウンド",
    "_BackAroundReverse_": "バックアラウンドリバース",
    "_NeoBackAround_": "ネオバックアラウンド",
    "_NeoBackAroundReverse_": "ネオバックアラウンドリバース",
    "_Shadow_": "シャドウ",
    "_ShadowReverse_": "シャドウリバース",
    "_ScissorSpin_": "シザースピン"
}
const SHORT_KATAKANA_HALF_DICT = {
    "=>": "⇒",
    "_Normal_": "ﾉｰﾏﾙ",
    "_Reverse_": "ﾘﾊﾞｰｽ",
    "_Sonic_": "ｿﾆｯｸ",
    "_SonicReverse_": "ｿﾆﾘﾊﾞ",
    "_SymmetricalSonic_": "ｼﾒｿﾆ",
    "_SymmetricalSonicReverse_": "ｼﾒｿﾆﾘﾊﾞ",
    "_Pass_": "ﾊﾟｽ",
    "_PassReverse_": "ﾊﾟｽﾘﾊﾞ",
    "_SymmetricalPass_": "ｼﾒﾊﾟｽ",
    "_SymmetricalPassReverse_": "ｼﾒﾊﾟｽﾘﾊﾞ",
    "_Charge_": "ﾁｬｰｼﾞ",
    "_ChargeReverse_": "ﾁｬｰｼﾞﾘﾊﾞ",
    "_HalfWindmill_": "ﾊﾌｳｨﾝ",
    "_HalfWindmillReverse_": "ﾊﾌｳｨﾝﾘﾊﾞ",
    "_Gunman_": "ｶﾞﾝﾏﾝ",
    "_GunmanReverse_": "ｶﾞﾝﾘﾊﾞ",
    "_SymmetricalGunman_": "ｼﾒｶﾞﾝ",
    "_SymmetricalGunmanReverse_": "ｼﾒｶﾞﾝﾘﾊﾞ",
    "_BackAround_": "ﾊﾞｸｱﾗ",
    "_BackAroundReverse_": "ﾊﾞｸﾘﾊﾞ",
    "_NeoBackAround_": "ﾈｵﾊﾞ",
    "_NeoBackAroundReverse_": "ﾈｵﾊﾞﾘﾊﾞ",
    "_Shadow_": "ｼｬﾄﾞｳ",
    "_ShadowReverse_": "ｼｬﾄﾞｳﾘﾊﾞ",
    "_ScissorSpin_": "ｼｻﾞｽﾋﾟ"
}
const SHORT_KATAKANA_DICT = {
    "=>": "⇒",
    "_Normal_": "ノーマル",
    "_Reverse_": "リバース",
    "_Sonic_": "ソニック",
    "_SonicReverse_": "ソニリバ",
    "_SymmetricalSonic_": "シメソニ",
    "_SymmetricalSonicReverse_": "シメソニリバ",
    "_Pass_": "パス",
    "_PassReverse_": "パスリバ",
    "_SymmetricalPass_": "シメパス",
    "_SymmetricalPassReverse_": "シメパスリバ",
    "_Charge_": "チャージ",
    "_ChargeReverse_": "チャージリバ",
    "_HalfWindmill_": "ハフウィン",
    "_HalfWindmillReverse_": "ハフウィンリバ",
    "_Gunman_": "ガンマン",
    "_GunmanReverse_": "ガンリバ",
    "_SymmetricalGunman_": "シメガン",
    "_SymmetricalGunmanReverse_": "シメガンリバ",
    "_BackAround_": "バクアラ",
    "_BackAroundReverse_": "バクリバ",
    "_NeoBackAround_": "ネオバ",
    "_NeoBackAroundReverse_": "ネオバリバ",
    "_Shadow_": "シャドウ",
    "_ShadowReverse_": "シャドウリバ",
    "_ScissorSpin_": "シザスピ"
}
const SUPER_SHORT_KATAKANA_DICT = {
    "=>": "⇒",
    "_Normal_": "ノマ",
    "_Reverse_": "リバ",
    "_Sonic_": "ソニ",
    "_SonicReverse_": "ソニリバ",
    "_SymmetricalSonic_": "シメソニ",
    "_SymmetricalSonicReverse_": "シメソニリバ",
    "_Pass_": "パス",
    "_PassReverse_": "パスリバ",
    "_SymmetricalPass_": "シメパス",
    "_SymmetricalPassReverse_": "シメパスリバ",
    "_Charge_": "チャジ",
    "_ChargeReverse_": "チャジリバ",
    "_HalfWindmill_": "ハフウィン",
    "_HalfWindmillReverse_": "ハフウィンリバ",
    "_Gunman_": "ガン",
    "_GunmanReverse_": "ガンリバ",
    "_SymmetricalGunman_": "シメガン",
    "_SymmetricalGunmanReverse_": "シメガンリバ",
    "_BackAround_": "バク",
    "_BackAroundReverse_": "バクリバ",
    "_NeoBackAround_": "ネオ",
    "_NeoBackAroundReverse_": "ネオリバ",
    "_Shadow_": "シャド",
    "_ShadowReverse_": "シャドリバ",
    "_ScissorSpin_": "シザスピ"
}

function toKatakana(orderstr) {
    return replaceByDict(orderstr, KATAKANA_DICT);
}

function toShortKatakana(orderstr) {
    return replaceByDict(orderstr, SHORT_KATAKANA_DICT);
}

function toSuperShortKatakana(orderstr) {
    return replaceByDict(orderstr, SUPER_SHORT_KATAKANA_DICT);
}

function replaceByDict(orderstr, dict) {
    for (const key in dict) {
        orderstr = orderstr.replace(new RegExp(key, 'g'), dict[key]);
    }
    return orderstr;
}

function countTwtrLength(tarstr) {
    let lngt = 0;
    for (const c in tarstr) {
        if (c.match(/[ -~]/))
            lngt += 0.5;
        else
            lngt += 1;
    }
    return lngt;
}