<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LigneInventaireRepository; // Vérifie bien cet import
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource]
#[ORM\Entity(repositoryClass: LigneInventaireRepository::class)] // C'était ici l'erreur
class LigneInventaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['inventaire:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'lignes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Inventaire $inventaire = null;

    #[ORM\Column(length: 255)]
    #[Groups(['inventaire:read'])]
    private ?string $nomProduit = null;

    #[ORM\Column]
    #[Groups(['inventaire:read'])]
    private ?int $quantite = null;

    // --- Getters et Setters ---

    public function getId(): ?int { return $this->id; }
    
    public function getInventaire(): ?Inventaire { return $this->inventaire; }
    public function setInventaire(?Inventaire $inventaire): static { $this->inventaire = $inventaire; return $this; }

    public function getNomProduit(): ?string { return $this->nomProduit; }
    public function setNomProduit(string $nomProduit): static { $this->nomProduit = $nomProduit; return $this; }

    public function getQuantite(): ?int { return $this->quantite; }
    public function setQuantite(int $quantite): static { $this->quantite = $quantite; return $this; }
}