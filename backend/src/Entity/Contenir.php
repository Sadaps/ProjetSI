<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\ContenirRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
#[ApiResource(
    normalizationContext: ['groups' => ['contenir:read', 'commande:read',]]
)]
#[ORM\Entity(repositoryClass: ContenirRepository::class)]
class Contenir
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['contenir:read', 'commande:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['contenir:read', 'commande:read'])]
    private ?int $quantite = null;

    #[ORM\ManyToOne(inversedBy: 'contenir')]
    #[ORM\JoinColumn(nullable: false)]
    // SURTOUT PAS de Groups ici (sinon on repart vers Commande -> boucle)
    private ?Commande $commande = null;

    #[ORM\ManyToOne(inversedBy: 'contenir')]
    #[ORM\JoinColumn(nullable: false)]
#[Groups(['contenir:read', 'commande:read'])]
    private ?Produit $produit = null;
    
#[Groups(['contenir:read', 'commande:read'])]
    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    private ?string $poids_attendu = null;

    public function getId(): ?int { return $this->id; }

    public function getQuantite(): ?int { return $this->quantite; }
    public function setQuantite(int $quantite): static { $this->quantite = $quantite; return $this; }

    public function getCommande(): ?Commande { return $this->commande; }
    public function setCommande(?Commande $commande): static { $this->commande = $commande; return $this; }

    public function getProduit(): ?Produit { return $this->produit; }
    public function setProduit(?Produit $produit): static { $this->produit = $produit; return $this; }

    public function getPoidsAttendu(): ?string
    {
        return $this->poids_attendu;
    }

    public function setPoidsAttendu(?string $poids_attendu): static
    {
        $this->poids_attendu = $poids_attendu;

        return $this;
    }
}