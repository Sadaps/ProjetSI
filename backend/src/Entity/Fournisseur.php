<?php

namespace App\Entity;

use App\Repository\FournisseurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
<<<<<<< HEAD
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    normalizationContext: ['groups' => ['fournisseur:read', 'commande:read']]
)]
=======
use Symfony\Component\Serializer\Attribute\Groups; 

>>>>>>> fournisseur-Thibaut
#[ORM\Entity(repositoryClass: FournisseurRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['fournisseur:read']] 
)]
class Fournisseur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['fournisseur:read'])] 
    private ?int $id = null;

<<<<<<< HEAD
    #[ORM\Column(length: 50)]
    #[Groups(['fournisseur:read', 'commande:read'])]
=======
    #[ORM\Column(length: 255)]
    #[Groups(['fournisseur:read'])] 
>>>>>>> fournisseur-Thibaut
    private ?string $nom = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?string $telephone = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?string $adresse = null;


    #[ORM\OneToMany(targetEntity: Contact::class, mappedBy: 'fournisseur')]
    #[Groups(['fournisseur:read'])]
    private Collection $contact;

    /**
     * @var Collection<int, FournisPar>
     */
    #[ORM\OneToMany(targetEntity: FournisPar::class, mappedBy: 'fournisseur')]
    private Collection $fournisPar;

    /**
     * @var Collection<int, Commande>
     */
    #[ORM\OneToMany(targetEntity: Commande::class, mappedBy: 'fournisseur')]
    private Collection $commandes;

    public function __construct()
    {
        $this->fournisPar = new ArrayCollection();
        $this->contact = new ArrayCollection();
        $this->commandes = new ArrayCollection();
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

    /**
     * @return Collection<int, Commande>
     */
    public function getCommandes(): Collection
    {
        return $this->commandes;
    }

    public function addCommande(Commande $commande): static
    {
        if (!$this->commandes->contains($commande)) {
            $this->commandes->add($commande);
            $commande->setFournisseur($this);
        }

        return $this;
    }

    public function removeCommande(Commande $commande): static
    {
        if ($this->commandes->removeElement($commande)) {
            // set the owning side to null (unless already changed)
            if ($commande->getFournisseur() === $this) {
                $commande->setFournisseur(null);
            }
        }

        return $this;
    }
}
