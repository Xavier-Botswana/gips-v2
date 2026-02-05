import axios from "axios";

const sendToAdmissions = (details) => {


  const {expand,id} = details;
  // eslint-disable-next-line camelcase
  const {national_id,firstname,lastname} = expand.guest_id;
    // eslint-disable-next-line camelcase
   const {name,duration,program_code,commencement_date,completion_date} = expand.option_one;

  
   console.log("lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll")
   console.log( details)
   console.log("lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll")

   const data = JSON.stringify({
        "type": [
          {
            "target_id": "program_of_study"
          }
        ],
        "title": [
          {
            "value": ""
          }
        ],
        "id": [
          {
             // eslint-disable-next-line camelcase
            "value": `${national_id}`
          }
        ],
        "surname": [
          {
            "value":  `${lastname}`
          }
        ],
        "firstname": [
          {
            "value": `${firstname}`
          }
        ],
        "institution": [
          {
            "value": "Gaborone Institute of Professional Studies"
          }
        ],
        "institution_program_code": [
          {
             // eslint-disable-next-line camelcase
            "value":  `${program_code}`
          }
        ],
        "program_name": [
          {
            "value":  `${name}`
          }
        ],
        "program_duration": [
          {
            "value":  `${duration}`
          }
        ],
        "start_date": [
          {
              // eslint-disable-next-line camelcase
            "value": `${commencement_date}`
          }
        ],
        "completion_date": [
          {
              // eslint-disable-next-line camelcase
            "value": `${completion_date}`
          }
        ],
        "entry_level": [
          {
            "value": "1"
          }
        ],
        "cost": [
          {
            "value": "10000"
          }
        ]
      });

      console.log("studentlllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll")
      console.log( details)
      console.log("studentlllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll")
   
  const config1 = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://tef2.gov.bw/rest/session/token',
    headers: { }
  };

  const username = 'peggytau00@gmail.com';
  const password = '379528116';
  const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;


  
  
  
  axios.request(config1)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    const token = JSON.stringify(response.data)

    const config2 = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://tef2.gov.bw/api/post/studentadmissions?_format=hal_json',
        headers: { 
          'Accept': '*/*', 
          'X-CSRF-Token': token, 
          'Content-Type': 'application/hal+json', 
          'Authorization': basicAuthHeader, 
        },
        data 
      };

     
axios.request(config2)
.then(async (response) => {
  console.log(JSON.stringify(response.data));
  await  axios.patch(`/v1/applications/${id}`, { dtef_status: 'Submitted' }).then((res)=>{
    console.log("SUBMITTED SUBMITTED SUBMITTED ")
console.log(res.data)
 
  })
 
})
.catch((error) => {
  console.log(error);
});

  })
  .catch((error) => {
    console.log(error);
  });
};

export default sendToAdmissions;
