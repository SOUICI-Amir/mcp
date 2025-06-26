const fs = require("fs");
const path = require("path");
const { Servient } = require("@node-wot/core");
const { HttpServer } = require("@node-wot/binding-http");

async function main() {

  const tdRaw = fs.readFileSync(path.join(__dirname, "robotTD.json"), "utf8");
  const td = JSON.parse(tdRaw);
  

  const servient = new Servient();
  servient.addServer(new HttpServer({ port: 9090 }));
  const WoT = await servient.start();
  const thing = await WoT.produce(td);
  thing.setActionHandler("start", async () => {
    console.log("Action marche exécutée")
  });

  thing.setActionHandler("stop", async () => {
    console.log("Action arret exécutée")
  });
 
  await thing.expose();
}
main();
