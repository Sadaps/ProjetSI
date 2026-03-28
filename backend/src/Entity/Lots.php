<?php

namespace App\Entity;

use App\Repository\LotsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LotsRepository::class)]
class Lots
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    private ?string $poids = null;

    #[ORM\Column]
    private ?int $quantite = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $datePeremption = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $dateEntreeLot = null;

    #[ORM\ManyToOne(inversedBy: 'lots')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Produit $produit = null;

    /**
     * @var Collection<int, VerifierLot>
     */
    #[ORM\OneToMany(targetEntity: VerifierLot::class, mappedBy: 'lot')]
    private Collection $verifierLot;

    /**
     * @var Collection<int, Recu>
     */
    #[ORM\OneToMany(targetEntity: Recu::class, mappedBy: 'lot')]
    private Collection $recus;

    public function __construct()
    {
        $this->verifierLot = new ArrayCollection();
        $this->recus = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPoids(): ?string
    {
        return $this->poids;
    }

    public function setPoids(?string $poids): static
    {
        $this->poids = $poids;

        return $this;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getDatePeremption(): ?\DateTime
    {
        return $this->datePeremption;
    }

    public function setDatePeremption(\DateTime $datePeremption): static
    {
        $this->datePeremption = $datePeremption;

        return $this;
    }

    public function getDateEntreeLot(): ?\DateTime
    {
        return $this->dateEntreeLot;
    }

    public function setDateEntreeLot(\DateTime $dateEntreeLot): static
    {
        $this->dateEntreeLot = $dateEntreeLot;

        return $this;
    }

    public function getProduit(): ?Produit
    {
        return $this->produit;
    }

    public function setProduit(?Produit $produit): static
    {
        $this->produit = $produit;

        return $this;
    }

    /**
     * @return Collection<int, VerifierLot>
     */
    public function getVerifierLot(): Collection
    {
        return $this->verifierLot;
    }

    public function addVerifierLot(VerifierLot $verifierLot): static
    {
        if (!$this->verifierLot->contains($verifierLot)) {
            $this->verifierLot->add($verifierLot);
            $verifierLot->setLot($this);
        }

        return $this;
    }

    public function removeVerifierLot(VerifierLot $verifierLot): static
    {
        if ($this->verifierLot->removeElement($verifierLot)) {
            // set the owning side to null (unless already changed)
            if ($verifierLot->getLot() === $this) {
                $verifierLot->setLot(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Recu>
     */
    public function getRecus(): Collection
    {
        return $this->recus;
    }

    public function addRecu(Recu $recu): static
    {
        if (!$this->recus->contains($recu)) {
            $this->recus->add($recu);
            $recu->setLot($this);
        }

        return $this;
    }

    public function removeRecu(Recu $recu): static
    {
        if ($this->recus->removeElement($recu)) {
            // set the owning side to null (unless already changed)
            if ($recu->getLot() === $this) {
                $recu->setLot(null);
            }
        }

        return $this;
    }
}
