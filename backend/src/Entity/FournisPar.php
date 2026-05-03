<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['fournis_par:read']]
)]
class FournisPar
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['produit:read', 'fournis_par:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
    #[Groups(['produit:read', 'fournis_par:read', 'commande:read'])]
    private ?string $prix = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
    #[Groups(['produit:read', 'fournis_par:read', 'commande:read'])]
    private ?string $MOQ = null;

    #[ORM\ManyToOne(inversedBy: 'fournisPar')]
    #[ORM\JoinColumn(nullable: false)]
    // ICI : Pas de Group 'produit:read' ! On ne veut PAS que le produit s'affiche 
    // quand on liste les produits.
    private ?Produit $produit = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['produit:read', 'fournis_par:read', 'commande:read'])]
    private ?Fournisseur $fournisseur = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['produit:read', 'commande:read'])]
    private ?int $delai_min = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['produit:read', 'commande:read'])]
    private ?int $delai_max = null;

    public function getId(): ?int { return $this->id; }
    public function getPrix(): ?string { return $this->prix; }
    public function setPrix(string $prix): static { $this->prix = $prix; return $this; }
    public function getMOQ(): ?string { return $this->MOQ; }
    public function setMOQ(string $MOQ): static { $this->MOQ = $MOQ; return $this; }
    public function getProduit(): ?Produit { return $this->produit; }
    public function setProduit(?Produit $produit): static { $this->produit = $produit; return $this; }
    public function getFournisseur(): ?Fournisseur { return $this->fournisseur; }
    public function setFournisseur(?Fournisseur $fournisseur): static { $this->fournisseur = $fournisseur; return $this; }

    public function getDelaiMin(): ?int
    {
        return $this->delai_min;
    }

    public function setDelaiMin(?int $delai_min): static
    {
        $this->delai_min = $delai_min;

        return $this;
    }

    public function getDelaiMax(): ?int
    {
        return $this->delai_max;
    }

    public function setDelaiMax(?int $delai_max): static
    {
        $this->delai_max = $delai_max;

        return $this;
    }
}