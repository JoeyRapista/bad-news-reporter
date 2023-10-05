  document.addEventListener('alpine:init', () => {
    Alpine.data('main_state', () => ({
        files: null,
        report: null,
        tableData: [],
        alertMessage: '',
        showAlertMessage: false,
        company_prods: {
          mumbai:  [ '200','100','F00','O00','610','H10','P10','T10','U10','Y10','320','420','520','620','720','820','920','A20','B20','C20','D20' ] ,
          detail:  [ 'U10','Y10','Z10','W10','G10' ], 
          ms_iso:  [ 'A00','C00','510' ]
        },
        company_code : {
          "A00" : "MS PRICE",
          "110" : "NINTENDO BENELUX",
          "100" : "GARMIN",
          "200" : "ZOUND",
          "E00" : "FRONTLINE",
          "K00" : "RAZER",
          "S00" : "F-Secure",
          "T00" : "3M",
          "U00" : "NINTENDO BRAZIL",
          "W00" : "PIERRE FABRE",
          "P00" : "MOTOROLA",
          "X00" : "NINTENDO MEXICO ",
          "F00" : "SAMSUNG MOBILE",
          "O00" : "SAMSUNG CE  ",
          "P10" : "Miele",
          "610" : "Eva Solo",
          "H10" : "Zurn",
          "000" : "MS EEO",
          "P10" : "Miele Maintenance ",
          "C00" : "MS",
          "T10" : "Samsung Nordics",
          "U10" : "DAP",
          "G10" : "Manufacturing Demo",
          "310" : "inRiver Staging",
          "Z10" : "EDCO",
          "020" : "CPM AUSTRALIA",
          "Y10" : "Mohawk",
          "320" : "Triumph",
          "420" : "Etex",
          "520" : "Prysmian",
          "620" : "Carhartt	",
          "720" : "Visual Comfort",
          "820" : "Hunkemöller",
          "920" : "Wall Family",
          "A20" : "John Deere	",
          "B20" : "GN Hearing	",
          "C20" : "Herbalife	",
          "D20" : "Jr Simplot"
        },
        // FUNCTION
        handled_generate_report() { 
            if (this.files) { 
                  const file = this.files[0]  
                  readXlsxFile(file).then((rows) => { 
                  this.tableData = this.convertArrayToObjects(rows) 
                  const grouped = this.groupObjects(this.tableData)
                  _json = JSON.stringify(grouped, null, 4)
                  this.report = _json.replace(/["{}\[\],]/g, '');
              })  
            }else{
              console.log('No file')
            }
            
        },

        // HELPER FUNCTION
        convertArrayToObjects(rows){
          try {
           const tickets = rows.slice(1).map((row) => { 
              return {
                code: row[0] ? row[0].toString().slice(0, 3) : '',
                website: row[2] ? row[2].toString() : '',
                issue: row[4] ? row[4].toString() : '',
                action: row[6] || '',
                status: row[8] ? row[8].toString() : '',
              }  
          }) 
          return tickets
          } catch (error) {
            console.log('error in converting array to objects')
            console.log(error)
          }
        },

        // HELPER FUNCTION
        groupObjects(table){
          try {
            grouped_obj = table.reduce((acc, row) => {  
              const mappings = [
                { list: this.company_prods.mumbai, value: 'MUMBAI PRODUCTION' },
                { list: this.company_prods.detail, value: 'DETAIL PRODUCTION' },
                { list: this.company_prods.ms_iso, value: 'MS ISO PRODUCTION' },
              ];
              
              let prod = 'OTHERS';
              let t_status = 'VALID'
              for (const mapping of mappings) {
                if (mapping.list.includes(row.code)) {
                  prod = mapping.value;
                  break;
                }
              }
              
              // checking status
              const row_status = row.status.toLowerCase()
              const row_action = row.action.toLowerCase()
              const row_code = `${row.code.toUpperCase()} ${this.company_code[row.code.toUpperCase()].toUpperCase()}`  
              if (row_status.includes('in progress')){
                t_status = 'IN_PROGRESS'
              }else if (row_status.includes('for verification') && row_action.includes('rerun')){
                t_status = 'FIXED_BY_RERUN'
              }else if (row_status.includes('rebuild') && row_action.includes('fix')){
                t_status = 'FIXED_BY_CODE_UPDATE'
              } 
              acc[prod] = acc[prod] || {};
              acc[prod][t_status] = acc[prod][t_status] || {};
              acc[prod][t_status][row_code] = acc[prod][t_status][row_code] || [];

              acc[prod][t_status][row_code].push(`${row.website} | ${row.issue}`);
          
              return acc;
          }, {});
          return grouped_obj
          } catch (error) {
            console.log('error in grouping the converted objects')
            console.log(error)
          }
        },

        // COPY TO CLIP BOARD
        copyToClipboard(){  
          navigator.clipboard.writeText(this.report).then(() => {
             this.alertMessage = "Copied to clipboard!"
             this.showAlertMessage = true
             setTimeout(() => { this.showAlertMessage = false; }, 3000)
           }, function(err) {
             this.alertMessage = `Unable to copy error: ${err}`
             this.showAlertMessage = true
             setTimeout(() => { this.showAlertMessage = false; }, 3000)
           });
     }
    }))
})
 