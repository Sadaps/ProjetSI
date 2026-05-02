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
use App\Entity\Lots; // Assure-toi que ce use est là
use App\Entity\Inventaire;
use App\Entity\VerifierLot;
use App\Entity\Recu;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // --- 1. BASES ---
        $fonctionCom = new Fonction();
        $fonctionCom->setLibelle('Responsable Commercial');
        $manager->persist($fonctionCom);

        $catCosmetique = new Categorie();
        $catCosmetique->setNom('Cosmétique')->setDenomination('C');
        $manager->persist($catCosmetique);

        // --- 2. FOURNISSEURS ET CONTACTS AVEC FAKER ---

// On prépare une boîte (un tableau) pour stocker nos fournisseurs créés
$fournisseursReferences = []; 

// Créons 5 fournisseurs aléatoires
for ($i = 0; $i < 5; $i++) {
    $fournisseur = new Fournisseur();
    
    // Faker génère de vrais noms d'entreprises, téléphones et adresses françaises
    $fournisseur->setNom($faker->company())
                ->setTelephone($faker->phoneNumber())
                ->setAdresse($faker->address());
                
    $manager->persist($fournisseur);
    
    // On sauvegarde ce fournisseur dans notre tableau pour l'utiliser plus tard dans les commandes
    $fournisseursReferences[] = $fournisseur;

    // Pour CHAQUE fournisseur, on crée entre 1 et 3 contacts
    $nombreDeContacts = $faker->numberBetween(1, 3);
    
    for ($k = 0; $k < $nombreDeContacts; $k++) {
        $contact = new Contact();
        $contact->setNom($faker->lastName())
                ->setPrenom($faker->firstName())
                // companyEmail génère une adresse mail basée sur le nom généré
                ->setMail($faker->companyEmail()) 
                ->setFonction($fonctionCom) // Assure-toi que $fonctionCom est bien créé juste avant !
                ->setFournisseur($fournisseur);
                
        $manager->persist($contact);
    }
}

        // --- 3. PRODUITS + LOTS (MODIFIÉ POUR PLUSIEURS LOTS) ---
        $vraisProduitsData = [
            ['nom' => 'Huile d\'Amande Douce', 'sci' => 'Prunus Amygdalus Dulcis Oil', 'fonc' => 'Émollient'],
            ['nom' => 'Charbon Actif', 'sci' => 'Carbo Vegetabilis', 'fonc' => 'Purifiant'],
            ['nom' => 'Beurre de Karité', 'sci' => 'Butyrospermum Parkii Butter', 'fonc' => 'Nourrissant'],
            ['nom' => 'Acide Hyaluronique', 'sci' => 'Sodium Hyaluronate', 'fonc' => 'Actif hydratant'],
        ];

        $produitsReferences = [];
        $lotsReferences = []; 

        foreach ($vraisProduitsData as $data) {
            $produit = new Produit();
            $produit->setNom($data['nom'])->setNomScientifique($data['sci'])
                    ->setFonction($data['fonc'])->setCosmos('Certifié COSMOS Organic');
            
            if (method_exists($produit, 'setCategorie')) {
                $produit->setCategorie($catCosmetique);
            }

            $manager->persist($produit);
            $produitsReferences[] = $produit;

            // Liaison Fournisseur
            $fournisPar = new FournisPar();
            $fournisPar->setProduit($produit)->setFournisseur($fournisseur)
                       ->setPrix($faker->randomFloat(2, 5, 50))->setMOQ($faker->randomFloat(2, 1, 10));
            $manager->persist($fournisPar);

            // --- ICI : GÉNÉRATION DE 2 À 5 LOTS PAR PRODUIT ---
            $nbLots = $faker->numberBetween(2, 5);
            for ($j = 0; $j < $nbLots; $j++) {
                $lot = new Lots();
                $lot->setPoids($faker->randomFloat(2, 5, 100))
                    ->setQuantite($faker->numberBetween(10, 100))
                    ->setDatePeremption($faker->dateTimeBetween('+1 year', '+3 years'))
                    // On décale un peu les dates d'entrée pour le réalisme
                    ->setDateEntreeLot($faker->dateTimeBetween('-1 month', 'now'))
                    ->setProduit($produit);
                
                $manager->persist($lot);
                $lotsReferences[] = $lot;
            }
        }

        // --- 4. FAKER PRODUITS ---
        for ($i = 0; $i < 10; $i++) {
            $produitAlea = new Produit();
            $produitAlea->setNom(ucfirst($faker->word()))
                        ->setNomScientifique(ucfirst($faker->word()) . ' ' . $faker->word())
                        ->setFonction($faker->randomElement(['Conservateur', 'Solvant', 'Parfum']));
            if (method_exists($produitAlea, 'setCategorie')) {
                $produitAlea->setCategorie($catCosmetique);
            }
            $manager->persist($produitAlea);
        }

        // --- 5. COMMANDE ---
       // On boucle pour créer 15 commandes
for ($i = 0; $i < 15; $i++) {
    $commande = new Commande();
    
    // Génération de données aléatoires réalistes
             $commande->setDateCommande($faker->dateTimeBetween('-2 months', '+1 month'))
             ->setPrix($faker->randomFloat(2, 50, 3000)) // Prix entre 50.00 et 3000.00
             ->setDelaiMin($faker->numberBetween(1, 3))
             ->setDelaiMax($faker->numberBetween(4, 15))
             ->setFournisseur($faker->randomElement($fournisseursReferences))
             // On met plus de "En attente" pour que tu aies de quoi tester ta réception sur Angular
             ->setStatut($faker->randomElement(['En attente', 'En attente', 'En attente', 'Reçue', 'Annulée'])); 
    
    $manager->persist($commande);

    // On va ajouter entre 1 et 4 produits aléatoires à cette commande
    $nombreProduits = $faker->numberBetween(1, 4);
    
    // On copie et on mélange ton tableau de références pour piocher au hasard sans avoir de doublons
    $produitsMelanges = $produitsReferences;
    shuffle($produitsMelanges);

for ($j = 0; $j < $nombreProduits; $j++) {
        // On stocke la quantité dans une variable pour s'en servir pour le calcul du poids
        $quantiteAchetee = $faker->numberBetween(5, 100);
        
        // On invente un faux poids unitaire pour le test (ex: entre 0.5kg et 5kg l'unité)
        $fauxPoidsUnitaire = $faker->randomFloat(2, 0.5, 5.0); 
        
        // Le poids total attendu = quantité * poids unitaire
        $poidsTotalAttendu = $quantiteAchetee * $fauxPoidsUnitaire;

        $contenir = new Contenir();
        $contenir->setCommande($commande)
                 ->setProduit($produitsMelanges[$j]) 
                 ->setQuantite($quantiteAchetee)
                 // 👈 AJOUT : On enregistre le poids attendu en format "string" pour le type Decimal
                 ->setPoidsAttendu(number_format($poidsTotalAttendu, 2, '.', '')); 
        
        $manager->persist($contenir);
    }
}

        // --- 7. INVENTAIRE ---
        $inventaire = new Inventaire();
        $inventaire->setDateInv(new \DateTime());
        $manager->persist($inventaire);

        foreach ($lotsReferences as $lot) {
            $verifier = new VerifierLot(); 
            $verifier->setInventaire($inventaire)
                     ->setLot($lot)
                     ->setQuantite($lot->getQuantite() - 1);
            $manager->persist($verifier);
        }

        // --- 8. REÇU ---
        if (!empty($lotsReferences)) {
            $recu = new Recu();
            $recu->setCommande($commande)
                 ->setLot($lotsReferences[0])
                 ->setQuantite(10)
                 ->setDateReception(new \DateTime());
            $manager->persist($recu);
        }

        $manager->flush();
    }
}