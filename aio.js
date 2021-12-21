/** @param {NS} ns **/
export async function main(ns) {
    var target = ns.args[0];
    const useDebug = false;
    if (useDebug) ns.tprint("Attacking " + target + " from " + ns.getHostname());
    while (true) {
        var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
        var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}