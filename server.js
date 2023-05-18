const bodyParser = require("body-parser");
const path = require('path');
const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const mysql = require('mysql');

//nombre de description affichée par page
const resultatParPage = 20;

//mettre en place l'acces au fichier views
app.set('views',path.join(__dirname,'views'));

//mettre en place le moteur de vue
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//se servir des dossier static public
app.use(express.static('public'));

//utilisation de session et flash
app.use(session({
  secret: 'cSd_;t#2X4D4',
  cookie: { maxAge: 60000},
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.listen(3000, () => {
  console.log("Serveur démarré (http://localhost:3000/) !!!");
});

//Connexion à la base de donnée
const connection = mysql.createConnection({
  host: 'localhost', //URL Prod: http://velesay.intranet.cg974.fr/phpmyadmin/
  user: 'root', //e_r pour la prod
  password: '',
  database: 'e_r'
});

connection.connect(function(error){
  if(!!error) console.log(error);
  else console.log('connecté à la BDD');
});

//Appel Active directory
const ActiveDirectory = require('activedirectory');

// Configuration de l'Active Directory
const config = {
  url: 'ldap://your-ad-server', // URL du serveur Active Directory
  baseDN: 'dc=example,dc=com', // Base DN de l'Active Directory
};

// Création de l'instance ActiveDirectory
const ad = new ActiveDirectory(config);

// Route de connexion
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Authentification de l'utilisateur dans l'Active Directory
  ad.authenticate(username, password, (err, auth) => {
    if (err) {
      console.log('Erreur d\'authentification :', err);
      req.flash("isconnected", "false");
      res.status(500).send('Erreur d\'authentification');
      return;
    }

    if (!auth) {
      console.log('Authentification échouée pour l\'utilisateur :', username);
      req.flash("isconnected", "false");
      res.status(401).send('Authentification échouée');
      return;
    }

    // L'utilisateur est authentifié avec succès
    console.log('Authentification réussie pour l\'utilisateur :', username);
    req.flash("isconnected", "true");
    res.send('Authentification réussie');
  });
});

app.get("/", (req, res) => {
  let sql = "SELECT * FROM eims";
  let query = connection.query(sql, (err, rows) => {
    if(err) throw err;
    const numResultat = rows.length;
    const numPages = Math.ceil(numResultat / resultatParPage);
    let page = req.query.page ? Number(req.query.page) : 1;
    if(numPages == 0){
      res.redirect('/?page='+encodeURIComponent('1'));
    }
    if(page > numPages){
      res.redirect('/?page='+encodeURIComponent(numPages));
    }else if(page < 1){
      res.redirect('/?page='+encodeURIComponent('1'));
    }
    //Le nombre d'EIM limite affichable par MariaDB
    const startinglimit = (page - 1) * resultatParPage;
    //nombre d'EIM pour la page d'acceuil
    sql = `SELECT * FROM eims LIMIT ${startinglimit},${resultatParPage}`;
    connection.query(sql, (err,rows) => {
      if(err) throw err;
      let iterator = (page - 5) < 1 ? 1 : page - 5;
      let finirLien = (iterator + 9) <= numPages ? (iterator + 9) : page + (numPages - page);

      if(finirLien < (page + 4)){
        iterator -= (page + 4) - numPages;
      }
      res.render('home', {eim: rows,page, iterator, finirLien, numPages, notif_ajout:req.flash('notif_ajout'), 
      notif_update:req.flash('notif_update'), notif_suppr:req.flash('notif_suppr'), isconnected:"false" });
    })

  });
  
});

app.get("/sauvegardeEIM", (req, res) => {
    const { exec } = require('child_process');

    exec('npx playwright test cloneEIMConfig.spec.js ', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erreur: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    });
    res.render('clonePageEIM');
});

app.get("/stopclone", (req, res) => {
  const { exec } = require('child_process');
  
  exec('taskkill /im firefox.exe /f', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur: ${error}`);
      res.status(500).send(`Erreur: ${error}`);
    } else {
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      res.render('home');
    }
  });
});

app.post("/ajouterEIM", (req, res) => {
  let data = {eim_numinv: req.body.numInv, eim_ip: req.body.hote, eim_mdp: req.body.mdp};

  let sql = "INSERT INTO eims SET ?";
  let query = connection.query(sql, data, (err, resulats) => {
    if(err) {
      req.flash("notif_ajout","EIM non ajoute !");
      res.redirect("/");
      throw err;
    };

    req.flash("notif_ajout", "EIM ajoute !");
    res.redirect("/");
  })

});

app.post("/getEIMDescription", (req, res) => {

  let sql = "SELECT * FROM eims WHERE eim_numinv = "+req.body.param;
  let query = connection.query(sql, (err, resulats) => {
    if(err) throw err;
    let descEIM = {eim_id: resulats[0].eim_id, eim_numinv: resulats[0].eim_numinv, eim_ip: resulats[0].eim_ip, eim_mdp: resulats[0].eim_mdp};
    res.send(descEIM);
  })

});

app.put('/updateEIM/:id', (req, res) => {
  const id = req.params.id;
  let data = {eim_numinv: req.body.eim_numinv, eim_ip: req.body.eim_ip, eim_mdp: req.body.eim_mdp}; 
  
  const sql = "UPDATE eims SET ? WHERE eim_id = ?";
  connection.query(sql, [data, id], (error, results) => {
    if(error) {
      req.flash("notif_update","EIM non modifie !");
      res.redirect("/");
      throw error;
    };

    req.flash("notif_update", "EIM modifie !");
    res.redirect("/");
  });
});

app.post("/supprimerEIM", (req, res) => {
  let sql = "DELETE FROM eims WHERE eim_id = "+req.body.SupprEIMid;
  let query = connection.query(sql, (err, resulats) => {
    if(err) {
      req.flash("notif_suppr","Echec de supression !");
      res.redirect("/");
      throw err;
    };

    req.flash("notif_suppr", "EIM supprime !");
    res.redirect("/");
  })
});

app.get('/search', (req, res) => {
  let motRecherche = req.query.termeRecherche;
  let page = req.query.page ? Number(req.query.page) : 1;

  const query = "SELECT * FROM eims WHERE eim_numinv LIKE '"+motRecherche+"' OR eim_ip LIKE '"+motRecherche+"' OR eim_mdp LIKE '"+motRecherche+"'";
  // Exécutez la requête de RECEHERCHE sur la base de données
  connection.query(query, (err, rows) => {
    if(err) throw err;
    const numResultat = rows.length;
    const numPages = Math.ceil(numResultat / resultatParPage);

    if(numPages == 0){
      res.redirect('/search?termeRecherche='+motRecherche+'&page='+encodeURIComponent('1'));
    }
    if(page > numPages){
      res.redirect('/search?termeRecherche='+motRecherche+'&page='+encodeURIComponent(numPages));
    }else if(page < 1){
      res.redirect('/search?termeRecherche='+motRecherche+'&page='+encodeURIComponent('1'));
    }
    //Le nombre d'EIM limite affichable par MariaDB
    const startinglimit = (page - 1) * resultatParPage;
    const start = startinglimit.toString();
    const end = resultatParPage.toString();

    //nombre d'EIM pour la page d'acceuil
    const sql = query + " LIMIT " +start+","+end;
    connection.query(sql, (err,rows) => {
      if(err) throw err;
      let iterator = (page - 5) < 1 ? 1 : page - 5;
      let finirLien = (iterator + 9) <= numPages ? (iterator + 9) : page + (numPages - page);

      if(finirLien < (page + 4)){
        iterator -= (page + 4) - numPages;
      }
      res.render('rechercheEIM', {eim: rows,page, iterator, finirLien, numPages, motRecherche, notif_ajout:req.flash('notif_ajout'), 
      notif_update:req.flash('notif_update'), notif_suppr:req.flash('notif_suppr') });
    })
  })
});

app.post("/search", (req, res) => {
  //console.log(req.body.SupprEIMid);
  let sql = "DELETE FROM eims WHERE eim_id = "+req.body.SupprEIMid;
  let query = connection.query(sql, (err, resulats) => {
    if(err) {
      req.flash("notif_suppr","Echec de supression !");
      res.redirect("/");
      throw err;
    };

    req.flash("notif_suppr", "EIM supprime !");
    res.redirect("/");
  })

});
