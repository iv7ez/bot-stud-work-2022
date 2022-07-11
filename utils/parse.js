function parse(text, dictionary) {
  const data = text
    .split(",")
    .map((part) => part.split(":").map((_) => _.trim().toLowerCase()));
  const obj = Object.fromEntries(data);
  const res = {};
  for (let key in obj) {
    if (key in dictionary) {
      res[dictionary[key]] = obj[key];
    }
  }
  //console.log(data, res)
  if(JSON.stringify(res) == "{}"){return null}
  return res
}
function format(data, glossary){
  if(Array.isArray(data)){
    return data.length ? data.map(item => format(item, glossary)).join(",\n\n") : "Нет данных"
  }
  const res = {}
  for(let key in glossary){
    res[key] = data[glossary[key]] || "Нет данных"
  }
  return Object.entries(res).map(e => e.join(": ")).join(", ")
}
module.exports = { parse, format };
