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

        // --- 2. FOURNISSEUR ---
        $fournisseur = new Fournisseur();
        $fournisseur->setNom('BioPlant France')->setTelephone('0102030405')->setAdresse('123 rue des Plantes, Paris');
        $manager->persist($fournisseur);

        $contact = new Contact();
        $contact->setNom('Dupont')->setPrenom('Jean')->setMail('jean.dupont@bioplant.fr')
                ->setFonction($fonctionCom)->setFournisseur($fournisseur);
        $manager->persist($contact);

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
        $commande = new Commande();
        $commande->setDateCommande(new \DateTime())
                 ->setPrix('450.00')
                 ->setDelaiMin(3)
                 ->setDelaiMax(7)
                 ->setFournisseur($fournisseur)
                 ->setStatut('En attente'); 
        
        $manager->persist($commande);

foreach ([$produitsReferences[0], $produitsReferences[1]] as $p) {
    $contenir = new Contenir();
    $contenir->setCommande($commande)
             ->setProduit($p)
             ->setQuantite(10);
    $manager->persist($contenir);
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