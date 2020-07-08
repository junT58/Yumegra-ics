(function(){
  // code from: https://qiita.com/i15fujimura1s/items/6fa5d16b1e53f04f3b06
  function base64Encode(...parts) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const offset = reader.result.indexOf(",") + 1;
        resolve(reader.result.slice(offset));
      };
      reader.readAsDataURL(new Blob(parts));
    });
  }

  function getics() {
    if (!location.href.match(/http[s]*:\/\/(www.)*yumenographia.com\/#\/mypage/)) {
        alert("マイページで実行してください。");
        return undefined;
    }
  
    const mode = window.prompt("出力モードを入力してください。\nall = 所有チケットすべて, diff = まだ出力していないチケット, last = 前回の結果も含めたチケット", "diff");
    if(mode == null) return undefined;
    const format = window.prompt("予定タイトルの形式を入力してください。\n以下の値が使用できます。\n%name% = キャスト名, %date% = 日付, %start% = 開始時刻, %end% = 終了時刻, %id% = チケットID", "ユメノグラフィア %name% (%id%)");
    if(format == null) return undefined;
    let timezone = window.prompt("タイムゾーンを入力してください。", "Asia/Tokyo");
    if(timezone == null) timezone = "Asia/Tokyo";
  
    const tickets = [];
    
    if(localStorage.getItem("yg_export") == undefined) localStorage.setItem("yg_export", JSON.stringify({
        last_exported: [],
        exported: []
    }));
    const ygr = JSON.parse(localStorage.getItem("yg_export"));
    const last_new = [];
    const exp_new = [];
  
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//COMPANY///Yumegra Ticket Calendar//JP\n";
  
    Array.prototype.forEach.call(document.getElementsByClassName("ticket-wrap"), function(item) {
      const content = item.getElementsByClassName("ticket-card__content");
      if(content.length <= 0) {
        alert("チケット情報が取得できませんでした。");
        return undefined;
      }
      const info = content.item(0);
      const time = info.getElementsByClassName("ticket-card__visitTime").item(0).innerHTML.split(" - ");
      const date = info.getElementsByClassName("ticket-card__visitDate").item(0).innerHTML.replace(/ \(.{3}\)/, "").split(".");
  
      var dt = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]) + ((parseInt(time[0].split(":")[0]) > parseInt(time[1].split(":")[0])) ? 1 : 0));
      const end = `${dt.getFullYear()}${('0' + (1 + dt.getMonth())).slice(-2)}${('0' + dt.getDate()).slice(-2)}`;
  
      const tid = info.getElementsByClassName("ticket-card__ticket_id").item(0).innerHTML.replace("code:", "");
      exp_new.push(tid);
      let title = format.replace(/%name%/g, info.getElementsByClassName("ticket-card__name").item(0).innerHTML).replace(/%date%/g, `${date[0]}/${date[1]}/${date[2]}`).replace(/%start%/g, time[0]).replace(/%end%/g, time[1]).replace(/%id%/g, tid);
      let value = `BEGIN:VEVENT\nDTSTART;TZID=${timezone}:${date[0]}${date[1]}${date[2]}T${time[0].replace(":", "")}00\nDTEND;TZID=${timezone}:${end}T${time[1].replace(":", "")}00\nSUMMARY:${title}\nBEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-P15M\nDESCRIPTION:15分後にチケットがあります。\nEND:VALARM\nBEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-P30M\nDESCRIPTION:30分後にチケットがあります。\nEND:VALARM\nUID:${tid}\nEND:VEVENT\n`;
  
      if(mode == "diff") {
        if(!ygr["exported"].includes(tid)) {
          ics += value;
          last_new.push(tid);
        }
      } else if(mode == "last") {
        if(!ygr["exported"].includes(tid) || ygr["last_exported"].includes(tid)) {
          ics += value;
          last_new.push(tid);
        }
      } else {
        ics += value;
        last_new.push(tid);
      }
    });
    
    if(last_new.length <= 0){
        alert("条件に合致するチケットがありませんでした。");
        return undefined;
    }
  
    ygr["last_exported"] = last_new;
    ygr["exported"] = exp_new;
  
    localStorage.setItem("yg_export", JSON.stringify(ygr));
  
    ics += "END:VCALENDAR";
  
    return ics;
  }
  
  let ics = getics();
  if(ics != null) {
    base64Encode(ics).then(encoded => { 
      const link = document.createElement("a");
      link.href = "data:text/calendar;base64;charset=utf8," + encoded;
      link.download = "calendar.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link)
    });
  }
})();