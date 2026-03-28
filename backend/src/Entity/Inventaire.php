<?php

namespace App\Entity;

use App\Repository\InventaireRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InventaireRepository::class)]
class Inventaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $dateInv = null;

    /**
     * @var Collection<int, VerifierLot>
     */
    #[ORM\OneToMany(targetEntity: VerifierLot::class, mappedBy: 'inventaire')]
    private Collection $verifierLot;

    public function __construct()
    {
        $this->verifierLot = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateInv(): ?\DateTime
    {
        return $this->dateInv;
    }

    public function setDateInv(\DateTime $dateInv): static
    {
        $this->dateInv = $dateInv;

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
            $verifierLot->setInventaire($this);
        }

        return $this;
    }

    public function removeVerifierLot(VerifierLot $verifierLot): static
    {
        if ($this->verifierLot->removeElement($verifierLot)) {
            // set the owning side to null (unless already changed)
            if ($verifierLot->getInventaire() === $this) {
                $verifierLot->setInventaire(null);
            }
        }

        return $this;
    }
}
