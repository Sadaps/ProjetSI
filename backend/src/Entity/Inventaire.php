<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\InventaireRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups; // N'oublie pas cet import !

#[ApiResource(
    normalizationContext: ['groups' => ['inventaire:read']] // <-- 1. C'est ça qui active les groupes !
)]
#[ORM\Entity(repositoryClass: InventaireRepository::class)]
class Inventaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['inventaire:read'])] // <-- 2. On autorise l'envoi de l'ID
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['inventaire:read'])] // <-- 3. On autorise l'envoi de la date
    private ?\DateTimeInterface $dateInv = null;

    #[ORM\OneToMany(targetEntity: LigneInventaire::class, mappedBy: 'inventaire', cascade: ['persist', 'remove'])]
    #[Groups(['inventaire:read'])] // <-- 4. On autorise l'envoi des lignes liées !
    private Collection $lignes;

    public function __construct()
    {
        $this->lignes = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getDateInv(): ?\DateTimeInterface { return $this->dateInv; }
    public function setDateInv(\DateTimeInterface $dateInv): static { $this->dateInv = $dateInv; return $this; }
    public function getLignes(): Collection { return $this->lignes; }
    
    public function addLigne(LigneInventaire $ligne): static
    {
        if (!$this->lignes->contains($ligne)) {
            $this->lignes->add($ligne);
            $ligne->setInventaire($this);
        }

        return $this;
    }

    public function removeLigne(LigneInventaire $ligne): static
    {
        if ($this->lignes->removeElement($ligne)) {
            // set the owning side to null (unless already changed)
            if ($ligne->getInventaire() === $this) {
                $ligne->setInventaire(null);
            }
        }

        return $this;
    }
}