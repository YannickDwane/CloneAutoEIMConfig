const { test, expect } = require('@playwright/test');

//Variable Global
//le nom du dossier de clone dans le répértoire courant
global.dossierClone = "./CLONE_EIM";
global.username = "admin";
global.ip = '10.120.2.2';
global.mdp = '123456';
global.numInv = '167712';

//creation de dossier pour stocket les fichier de configuration
const fs = require("fs");
const path = require('path');

if (!fs.existsSync(global.dossierClone)) {
  fs.mkdir(global.dossierClone, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log("New directory successfully created.")
    }
  })
}

test('EIM configs', async ({ page, context }) => {
    //exécution du test end to end pour chaque EIM 
   //console.log(rows[i].numInv);
    //exécution du test end to end pour chaque EIM 
    const url = 'http://'+ global.ip;

    /*if(rows[i].ip == '10.1.2.'){
      continue;
    }*/

    try{
      await page.goto(url);
    }catch(error){
      console.log(error);
      //on passe à l'itération suivante
      await page.close();
    }
    // Le titre contient bien "Top Access"
    /* s'il y a un problème d'accès: continuer la boucle
    */

    await expect(page).toHaveTitle("TopAccess");
    //await page.pause();

    //pause de 10s dans l'absolu pour attendre l'affichage de la page
    await page.waitForTimeout(10000);

    //Click sur le lien "Connexion": recupération du frame puis accès à l'élément par selecteur css
    const topframe = page.frame('topframe');
    //await page.pause();
    await topframe?.locator("a.clsLogin").nth(1).isVisible();
    await topframe?.locator("a.clsLogin").nth(1).click();

    //pause de 6s dans l'absolu pour attendre l'affichage de la page de login (par une redirection interne dans TopAccess)
    await page.waitForTimeout(6000);

    //Saisie des logins/mots de passes: recupération du frame puis accès à l'élément par selecteur css
    const loginframe = page.frame('Loginframe');
    //await page.pause();
    await loginframe?.locator('input[name="USERNAME"]').fill(global.username);
    await loginframe?.locator('input[name="PASS"]').fill(global.mdp); //saisir le bon mot de passe depuis la BDD
    await loginframe?.getByRole('button', { name: 'Login' }).click();

    //si erreur causé par MDP erroné, ou compte admin bloqué => passer à l'itération suivante
    //pour cela vérifier la présence du bouton logout sur la page qui se charge après l'authentification
  
    //pause de 4s pour attendre l'appel du backend de la connexion
    await page.waitForTimeout(5000);
    try{
      const logoutVisible = page.frame('topframe')?.locator("a.clsLogin").nth(1).isVisible();
      if (!logoutVisible) {
        await page.close();
      }
    }catch (error){
      await page.close();
    }

    //await page.pause();

    //décomposer les actions du processus de clones [ car certaine version de page de top Acess ne font pas de redirection vers une URL unique pour le clone]
    //Click sur administration
    const topframe1 = page.frame('topframe');
    await topframe1?.getByRole('link', { name: 'Administration' }).isVisible();
    await topframe1?.getByRole('link', { name: 'Administration' }).click();

    //pause de 2s pour attendre l'appel du backend
    await page.waitForTimeout(4000);
    //Click sur maintenance
    const subMenu = page.frame('SubMenu');
    await subMenu?.getByRole('link', { name: 'Maintenance' }).isVisible();
    await subMenu?.getByRole('link', { name: 'Maintenance' }).click();

    //pause de 2s pour attendre l'appel du backend
    await page.waitForTimeout(3000);

    //click sur creer clone
    const fraTitle = page.frame('fraTitle');
    await fraTitle?.getByRole('link', { name: 'Create Clone File' }).isVisible();
    await fraTitle?.getByRole('link', { name: 'Create Clone File' }).click();

    //pause de 2s pour attendre l'appel du backend
    await page.waitForTimeout(3000);

    /*
    //Ouvir un nouvel onglet de création de clone
    await page.goto('https://10.1.2.3:10443/?MAIN=ADMIN&SUB=MAINT&CAT=CLONCREATE');
    // Le titre contient bien "Top Access"
    await expect(page).toHaveTitle("TopAccess");
    //await page.pause(); */

    //initialiser le frame du boutton "creer clone": pour effectuer le clone
    const fralist = page.frame('fraList');

    //Gerer l'appel d'une nouvelle page avec les CONTEXT: la page d'assignation de MDP au fichier clone
    const [promptClonePswd] = await Promise.all([
      context.waitForEvent('page'),
      //click sur le bouton clone (le déclencheur de l'appel de la nouvelle page)
      fralist?.getByRole('button', { name: 'Create' }).click()
    ])
    await promptClonePswd.waitForLoadState();

    //Acces à la nouvelle page
    await promptClonePswd.locator('input[name="txtPassword"]').fill('0000');
    await promptClonePswd.locator('input[name="reTypePassword"]').fill('0000');
    await promptClonePswd.getByRole('button', { name: 'OK' }).click();

    //attendre la fin du clone avant le téléchargement: attente moyenne de 14s[+ marge de 2s] pour contacter le backend (paramètre standard du clone en fonctionnement réseau LAN normal)
    //cela prend 26s pour un premier clone
    //await fralist?.waitForSelector('img[src="/Graphics/indicator.white.gif"]', { state: 'attached'});
    await page.waitForTimeout(30000);

    /*
    creer une exception si le fichier n'est pas disponible dans les 30s.
    Sinon: erreur dans le téléchargement
    */

    // Téléchargement du fichier de clone sur le fichier racine(root) du projet playwright
    // variable contenant le nom de la variable 

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      fralist?.locator("a").nth(0).click()
    ]);

    const nomDuFichier = global.numInv.toString() +".enc";
    await download.saveAs(nomDuFichier);

    //await page.pause();

    //Déplacer le fichier dans le dossier CLONE_EIM
    const fichierSource = "./"+nomDuFichier; // Chemin du fichier source

    // Récupérer le nom du fichier
    const ficPath = path.basename(fichierSource);

    // Construire le chemin de destination
    const cheminDestination = path.join(global.dossierClone, ficPath);

    // Déplacer le fichier vers le dossier de destination
    fs.renameSync(fichierSource, cheminDestination);

    //Déconnexion de TopAccess
    //Click sur le lien "Connexion": nouveau selecteur css (dans le contexte actuelle)
    const topframe2 = page.frame('topframe');
    //await page.pause();
    await topframe2?.locator("a.clsLogin").nth(1).isVisible();
    await topframe2?.locator("a.clsLogin").nth(1).click();

    //Pause d'1ms pour l'exécution en backend de la déconnexion
    await page.waitForTimeout(4000);

    //fermer la page en cours (pour éviter l'interférence lors du contact des autres EIM)
    //await page.close();
    //await context.close();
})