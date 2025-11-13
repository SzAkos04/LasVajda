// FIXME: nem mukszik still

const ref = db.ref("osztalyok");

// 4. Fetch data
ref.on("value", (snapshot) => {
  const data = snapshot.val();

  if (data) {
    Object.keys(data).forEach(key => {
      console.log(`${key}:`, data[key]);
    });
  } else {
    console.log("No data found.");
  }
});
