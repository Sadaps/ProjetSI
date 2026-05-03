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

        // --- 1. BASES ---
        $fonctionCom = new Fonction();
        $fonctionCom->setLibelle('Responsable Commercial');
        $manager->persist($fonctionCom);

        $catCosmetique = new Categorie();
        $catCosmetique->setNom('Cosmétique')->setDenomination('C');
        $manager->persist($catCosmetique);

        // --- 2. FOURNISSEURS ET CONTACTS AVEC FAKER ---
        $fournisseursReferences = []; 

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
            ['nom' => 'Huile d\'Amande Douce', 'sci' => 'Prunus Amygdalus Dulcis Oil', 'fonc' => 'Émollient'],
            ['nom' => 'Charbon Actif', 'sci' => 'Carbo Vegetabilis', 'fonc' => 'Purifiant'],
            ['nom' => 'Beurre de Karité', 'sci' => 'Butyrospermum Parkii Butter', 'fonc' => 'Nourrissant'],
            ['nom' => 'Acide Hyaluronique', 'sci' => 'Sodium Hyaluronate', 'fonc' => 'Actif hydratant'],
        ];

        $produitsReferences = [];
        $lotsReferences = []; 

        foreach ($vraisProduitsData as $data) {
            $produit = new Produit();
            $produit->setNom(substr($data['nom'], 0, 50))
                    ->setNomScientifique(substr($data['sci'], 0, 50))
                    ->setFonction(substr($data['fonc'], 0, 50))
                    ->setCosmos('Certifié COSMOS Organic');
            
            if (method_exists($produit, 'setCategorie')) {
                $produit->setCategorie($catCosmetique);
            }

            $manager->persist($produit);
            $produitsReferences[] = $produit;

            $fournisPar = new FournisPar();
            $fournisPar->setProduit($produit)->setFournisseur($fournisseur)
                       ->setPrix($faker->randomFloat(2, 5, 50))->setMOQ($faker->randomFloat(2, 1, 10));
            $manager->persist($fournisPar);

            $nbLots = $faker->numberBetween(2, 5);
            for ($j = 0; $j < $nbLots; $j++) {
                $lot = new Lots();
                $lot->setPoids($faker->randomFloat(2, 5, 100))
                    ->setQuantite($faker->numberBetween(10, 100))
                    ->setDatePeremption($faker->dateTimeBetween('+1 year', '+3 years'))
                    ->setDateEntreeLot($faker->dateTimeBetween('-1 month', 'now'))
                    ->setProduit($produit);
                
                $manager->persist($lot);
                $lotsReferences[] = $lot;
            }
        }

        // --- 4. FAKER PRODUITS ---
        for ($i = 0; $i < 10; $i++) {
            $produitAlea = new Produit();
            $produitAlea->setNom(substr(ucfirst($faker->word()), 0, 50))
                        ->setNomScientifique(substr(ucfirst($faker->word()) . ' ' . $faker->word(), 0, 50))
                        ->setFonction(substr($faker->randomElement(['Conservateur', 'Solvant', 'Parfum']), 0, 50));
            if (method_exists($produitAlea, 'setCategorie')) {
                $produitAlea->setCategorie($catCosmetique);
            }
            $manager->persist($produitAlea);
        }

        // --- 5. COMMANDE ---
        for ($i = 0; $i < 15; $i++) {
            $commande = new Commande();
            $commande->setDateCommande($faker->dateTimeBetween('-2 months', '+1 month'))
                     ->setPrix($faker->randomFloat(2, 50, 3000))
                     ->setDelaiMin($faker->numberBetween(1, 3))
                     ->setDelaiMax($faker->numberBetween(4, 15))
                     ->setFournisseur($faker->randomElement($fournisseursReferences))
                     ->setStatut($faker->randomElement(['En attente', 'En attente', 'En attente', 'Reçue', 'Annulée'])); 
            
            $manager->persist($commande);

            $nombreProduits = $faker->numberBetween(1, 4);
            $produitsMelanges = $produitsReferences;
            shuffle($produitsMelanges);

            for ($j = 0; $j < $nombreProduits; $j++) {
                $quantiteAchetee = $faker->numberBetween(5, 100);
                $fauxPoidsUnitaire = $faker->randomFloat(2, 0.5, 5.0); 
                $poidsTotalAttendu = $quantiteAchetee * $fauxPoidsUnitaire;

                $contenir = new Contenir();
                $contenir->setCommande($commande)
                         ->setProduit($produitsMelanges[$j]) 
                         ->setQuantite($quantiteAchetee)
                         ->setPoidsAttendu(number_format($poidsTotalAttendu, 2, '.', '')); 
                
                $manager->persist($contenir);
            }
        }

        // --- 7. INVENTAIRE ---
        $inventaire = new Inventaire();
        $inventaire->setDateInv(new \DateTime());
        $manager->persist($inventaire);

        foreach ($lotsReferences as $lot) {
            $ligne = new LigneInventaire(); 
            $ligne->setInventaire($inventaire)
                  ->setNomProduit(substr($lot->getProduit()->getNom(), 0, 255)) // Coupe par sécurité (même si LigneInventaire accepte 255)
                  ->setQuantite($lot->getQuantite() - 1);
            $manager->persist($ligne);
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