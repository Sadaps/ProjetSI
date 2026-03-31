<?php

namespace App\Entity;

use App\Repository\FournisseurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;

#[ApiResource]
#[ORM\Entity(repositoryClass: FournisseurRepository::class)]
class Fournisseur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $nom = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $adresse = null;

    /**
     * @var Collection<int, FournisPar>
     */
    #[ORM\OneToMany(targetEntity: FournisPar::class, mappedBy: 'fournisseur')]
    private Collection $fournisPar;

    /**
     * @var Collection<int, Contact>
     */
    #[ORM\OneToMany(targetEntity: Contact::class, mappedBy: 'fournisseur')]
    private Collection $contact;

    public function __construct()
    {
        $this->fournisPar = new ArrayCollection();
        $this->contact = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    /**
     * @return Collection<int, FournisPar>
     */
    public function getFournisPar(): Collection
    {
        return $this->fournisPar;
    }

    public function addFournisPar(FournisPar $fournisPar): static
    {
        if (!$this->fournisPar->contains($fournisPar)) {
            $this->fournisPar->add($fournisPar);
            $fournisPar->setFournisseur($this);
        }

        return $this;
    }

    public function removeFournisPar(FournisPar $fournisPar): static
    {
        if ($this->fournisPar->removeElement($fournisPar)) {
            // set the owning side to null (unless already changed)
            if ($fournisPar->getFournisseur() === $this) {
                $fournisPar->setFournisseur(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Contact>
     */
    public function getContact(): Collection
    {
        return $this->contact;
    }

    public function addContact(Contact $contact): static
    {
        if (!$this->contact->contains($contact)) {
            $this->contact->add($contact);
            $contact->setFournisseur($this);
        }

        return $this;
    }

    public function removeContact(Contact $contact): static
    {
        if ($this->contact->removeElement($contact)) {
            // set the owning side to null (unless already changed)
            if ($contact->getFournisseur() === $this) {
                $contact->setFournisseur(null);
            }
        }

        return $this;
    }
}
