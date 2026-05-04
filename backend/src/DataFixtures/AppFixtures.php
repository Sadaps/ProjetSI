<?php

namespace App\DataFixtures;

use App\Entity\Categorie;
use App\Entity\Commande;
use App\Entity\Contact;
use App\Entity\Contenir;
use App\Entity\Fonction;
use App\Entity\Fournisseur;
use App\Entity\FournisPar;
use App\Entity\Produit;
use App\Entity\Lots;
use App\Entity\Inventaire;
use App\Entity\LigneInventaire;
use App\Entity\Recu;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // --- 1. BASES (FONCTION & CATEGORIE) ---
        $fonctionCom = new Fonction();
        $fonctionCom->setLibelle('Responsable Commercial');
        $manager->persist($fonctionCom);

        $fonctionCompl = new Fonction();
        $fonctionCompl->setLibelle('Responsable Logistique');
        $manager->persist($fonctionCompl);

        $fonction = new Fonction();
        $fonction->setLibelle('Responsable Technique');
        $manager->persist($fonction);

        $fonction = new Fonction();
        $fonction->setLibelle('Gestionnaire de Stock');
        $manager->persist($fonction);

        $fonction = new Fonction();
        $fonction->setLibelle('Assistant Administration des Ventes');
        $manager->persist($fonction);

        $fonction = new Fonction();
        $fonction->setLibelle('Responsable Production');
        $manager->persist($fonction);

        $fonction = new Fonction();
        $fonction->setLibelle('Agent de Transit');
        $manager->persist($fonction);

        $fonctionAutre = new Fonction();
        $fonctionAutre->setLibelle('Autre');
        $manager->persist($fonctionAutre);


       // --- CATEGORIES ---
        $catCosmetique = new Categorie();
        $catCosmetique->setNom('Cosmétique')->setDenomination('C');
        $manager->persist($catCosmetique);

        // 👈 NOUVELLES CATÉGORIES
        $catMatierePremiere = new Categorie();
        $catMatierePremiere->setNom('Matière Première')->setDenomination('MP');
        $manager->persist($catMatierePremiere);

        $catConditionnement = new Categorie();
        $catConditionnement->setNom('Conditionnement')->setDenomination('PKG');
        $manager->persist($catConditionnement);

        // --- 2. FOURNISSEURS ET CONTACTS AVEC FAKER ---
        $fournisseursReferences = []; 

        $fournisseur = new Fournisseur();
        $fournisseur->setNom('BioPlant France')->setTelephone('0102030405')->setAdresse('123 rue des Plantes')->setMail('info@bioplant.fr')->setPays('France')->setVille('Paris');
        $manager->persist($fournisseur);

        for ($i = 0; $i < 5; $i++) {
            $fournisseur = new Fournisseur();
            
            // On coupe à 50 caractères max pour éviter l'erreur SQL
            $fournisseur->setNom(substr($faker->company(), 0, 50))
                        ->setTelephone(substr($faker->phoneNumber(), 0, 50))
                        ->setAdresse(substr($faker->address(), 0, 50));
                        
            $manager->persist($fournisseur);
            $fournisseursReferences[] = $fournisseur;

            $nombreDeContacts = $faker->numberBetween(1, 3);
            
            for ($k = 0; $k < $nombreDeContacts; $k++) {
                $contact = new Contact();
                $contact->setNom(substr($faker->lastName(), 0, 50))
                        ->setPrenom(substr($faker->firstName(), 0, 50))
                        ->setMail(substr($faker->companyEmail(), 0, 50)) 
                        ->setFonction($fonctionCom)
                        ->setFournisseur($fournisseur);
                        
                $manager->persist($contact);
            }
        }

       // --- 3. PRODUITS + LOTS ---
        $vraisProduitsData = [
            ['nom' => 'Huile d\'Amande Douce', 'sci' => 'Prunus Amygdalus Dulcis', 'fonc' => 'Émollient', 'unite' => 'ml', 'cat' => $catMatierePremiere],
            ['nom' => 'Beurre de Karité', 'sci' => 'Butyrospermum Parkii', 'fonc' => 'Nourrissant', 'unite' => 'g', 'cat' => $catMatierePremiere],
            ['nom' => 'Glycérine Végétale', 'sci' => 'Glycerin', 'fonc' => 'Humectant', 'unite' => 'ml', 'cat' => $catMatierePremiere],
            ['nom' => 'Argile Verte', 'sci' => 'Montmorillonite', 'fonc' => 'Purifiant', 'unite' => 'g', 'cat' => $catMatierePremiere],
            ['nom' => 'Charbon Actif', 'sci' => 'Activated Charcoal', 'fonc' => 'Détoxifiant', 'unite' => 'g', 'cat' => $catMatierePremiere],
            ['nom' => 'Acide Hyaluronique', 'sci' => 'Sodium Hyaluronate', 'fonc' => 'Actif hydratant', 'unite' => 'g', 'cat' => $catMatierePremiere], 
            ['nom' => 'Vitamine E', 'sci' => 'Tocopherol', 'fonc' => 'Antioxydant', 'unite' => 'ml', 'cat' => $catMatierePremiere],
            //  Les emballages passent en Conditionnement
            ['nom' => 'Flacons Verre 50ml', 'sci' => 'Pkg-V50', 'fonc' => 'Conditionnement', 'unite' => 'unité', 'cat' => $catConditionnement],
            ['nom' => 'Bouchons Pompe', 'sci' => 'Pkg-BP', 'fonc' => 'Conditionnement', 'unite' => 'unité', 'cat' => $catConditionnement],
            //  Les produits finis ou intermédiaires restent en Cosmétique
            ['nom' => 'Hydrolat de Rose', 'sci' => 'Rosa Damascena Water', 'fonc' => 'Apaisant', 'unite' => 'ml', 'cat' => $catCosmetique],
        ];

        $produitsReferences = [];
        $lotsReferences = []; 

        foreach ($vraisProduitsData as $data) {
            $produit = new Produit();
            $produit->setNom($data['nom'])
                    ->setNomScientifique($data['sci'])
                    ->setFonction($data['fonc'])
                    ->setCosmos('Certifié COSMOS Organic')
                    ->setUnite($data['unite']); 
            
            if (method_exists($produit, 'setCategorie')) {
                // 👈 On utilise la catégorie définie dans le tableau !
                $produit->setCategorie($data['cat']); 
            }

            $manager->persist($produit);
            $produitsReferences[] = $produit;

            // --- LIAISON FOURNISSEURS ---
            $fournisseursAleatoires = $faker->randomElements($fournisseursReferences, 2);
            foreach ($fournisseursAleatoires as $fRef) {
                $fournisPar = new FournisPar();
                $fournisPar->setProduit($produit)
                           ->setFournisseur($fRef)
                           ->setPrix($faker->randomFloat(2, 5, 80)); 

                if ($data['unite'] === 'g' || $data['unite'] === 'ml') {
                    $fournisPar->setMOQ((float)$faker->randomElement([250, 500, 1000, 5000])); 
                } else {
                    $fournisPar->setMOQ((float)$faker->randomElement([50, 100, 200])); 
                }

                $fournisPar->setDelaiMin($faker->numberBetween(2, 5)); 
                $fournisPar->setDelaiMax($faker->numberBetween(6, 15));
                $manager->persist($fournisPar);
            }

            // --- LOTS PAR PRODUIT ---
            $nbLots = $faker->numberBetween(1, 3);
            $totalQuantiteProduit = 0; // 👈 On initialise le compteur pour CE produit

            for ($j = 0; $j < $nbLots; $j++) {
                $lot = new Lots();
                
                if ($data['unite'] === 'g' || $data['unite'] === 'ml') {
                    $quantiteLot = $faker->randomElement([250, 500, 1000, 2500, 5000]);
                } else {
                    $quantiteLot = $faker->numberBetween(50, 250);
                }

                $lot->setContenanceRestante((float)$quantiteLot)
                    ->setNumeroLot('LOT-' . $faker->numberBetween(1000, 9999)) 
                    ->setDatePeremption($faker->dateTimeBetween('+1 year', '+3 years'))
                    ->setDateEntreeLot($faker->dateTimeBetween('-1 month', 'now'))
                    ->setProduit($produit);
                
                $manager->persist($lot);
                $lotsReferences[] = $lot;

                // 👈 On ajoute la quantité de ce lot au compteur global
                $totalQuantiteProduit += $quantiteLot; 
            }

            // 👈 MAINTENANT on attribue le vrai total calculé au produit !
            $produit->setQuantiteTotale((float)$totalQuantiteProduit); 
        }

        // --- 4. 15 COMMANDES (Issues de ta branche) ---
        for ($i = 0; $i < 15; $i++) {
            $commande = new Commande();
            $commande->setDateCommande($faker->dateTimeBetween('-2 months', 'now'))
                     ->setPrix($faker->randomFloat(2, 150, 3500))
                     ->setFournisseur($faker->randomElement($fournisseursReferences))
                     ->setStatut($faker->randomElement(['En attente', 'En attente', 'Reçue', 'Annulée'])); 
            
            $manager->persist($commande);

            $nombreProduits = $faker->numberBetween(1, 4);
            shuffle($produitsReferences); 

            for ($j = 0; $j < $nombreProduits; $j++) {
                $prodSelect = $produitsReferences[$j];
                $unite = $prodSelect->getUnite();

                if ($unite === 'g' || $unite === 'ml') {
                    $quantiteAchetee = (float)$faker->randomElement([100, 250, 500, 1000, 2500, 5000]);
                } else {
                    $quantiteAchetee = (float)$faker->randomElement([50, 100, 200, 500]);
                }

                $contenir = new Contenir();
                $contenir->setCommande($commande)
                         ->setProduit($prodSelect) 
                         ->setQuantite($quantiteAchetee); 
                
                $manager->persist($contenir);
            }
        }

        // --- 5. INVENTAIRE ---
        $inventaire = new Inventaire();
        $inventaire->setDateInv(new \DateTime());
        $manager->persist($inventaire);

        foreach ($lotsReferences as $lot) {
            $ligne = new LigneInventaire(); 
            $ligne->setInventaire($inventaire)
                  ->setNomProduit(substr($lot->getProduit()->getNom(), 0, 255)) 
                  ->setQuantite((float)($lot->getContenanceRestante() - 1)); 
            $manager->persist($ligne);
        }

        // --- 6. REÇU ---
        if (!empty($lotsReferences)) {
            $recu = new Recu();
            $recu->setCommande($commande) 
                 ->setLot($lotsReferences[0])
                 ->setQuantite(10)
                 ->setDateReception(new \DateTime());
            $manager->persist($recu);
        }

        // --- 7. On ajoute 2 produit pour tester le tableau de bord (lot sous le seuil) ---
        
        // Produit 1 : Huile d'Argan (Alerte Stock)
        $argan = new Produit();
        $argan->setNom("Huile d'Argan")
              ->setNomScientifique("Argania Spinosa")
              ->setFonction("Réparateur")
              ->setUnite("unités")
              ->setSeuil(10) 
              ->setQuantiteTotale(8); // Le total correspond déjà au seul lot en dessous, donc c'est ok !
              if (method_exists($argan, 'setCategorie')) {
             $argan->setCategorie($catMatierePremiere); 
        }
        $manager->persist($argan);

        $lotArgan = new Lots();
        $lotArgan->setNumeroLot("ARG-2024-089")
                 ->setContenanceRestante(8.0) 
                 ->setDatePeremption($faker->dateTimeBetween('+1 year', '+2 years'))
                 ->setProduit($argan)
                 ->setDateEntreeLot(new \DateTime());
        $manager->persist($lotArgan);

        // Produit 2 : Aloe Vera (Alerte Stock)
        $aloe = new Produit();
        $aloe->setNom("Aloe Vera")
              ->setNomScientifique("Aloe Barbadensis")
              ->setFonction("Hydratant")
              ->setUnite("unités")
              ->setSeuil(15)
              ->setQuantiteTotale(5); // Pareil, le total correspond déjà !
              if (method_exists($aloe, 'setCategorie')) {
             $aloe->setCategorie($catMatierePremiere);
        }
        $manager->persist($aloe);

        $lotAloe = new Lots();
        $lotAloe->setNumeroLot("ALO-2024-198")
                ->setContenanceRestante(5.0) 
                ->setDatePeremption($faker->dateTimeBetween('+5 days', '+10 days')) 
                ->setProduit($aloe)
                ->setDateEntreeLot(new \DateTime());
        $manager->persist($lotAloe);

        $manager->flush();
    }
}