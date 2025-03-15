import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  Mail,
  ExternalLink,
  Microscope,
  Linkedin,
  User,
} from "lucide-react";

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    schoolar?: string;
    website?: string;
  };
}

const TeamMember = ({
  name,
  role,
  bio,
  image,
  email,
  socialLinks,
}: TeamMemberProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="group rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 bg-card">
      <div className="flex items-center p-4">
        <div className="w-14 h-14 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-primary text-sm font-medium">{role}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-muted-foreground text-xs line-clamp-2">{bio}</p>

        {(socialLinks || email) && (
          <div className="mt-2 flex justify-end gap-4">
            {socialLinks && (
              <>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="flex items-center text-xs text-primary hover:underline"
                >
                  <User size={14} className="mr-1" />
                  Profil
                </button>
                {dialogOpen &&
                  ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white p-4 rounded-lg max-w-sm w-full flex">
                        {/* Gambar Profil di sisi kiri */}
                        <div className="mr-4">
                          <img
                            src={image}
                            alt={name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        </div>
                        {/* Detail Profil di sisi kanan */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{name}</h3>
                          <ul className="space-y-2">
                            {socialLinks.website && (
                              <li>
                                <a
                                  href={socialLinks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 hover:underline"
                                >
                                  <ExternalLink size={16} />
                                  <span>Website</span>
                                </a>
                              </li>
                            )}
                            {socialLinks.schoolar && (
                              <li>
                                <a
                                  href={socialLinks.schoolar}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 hover:underline"
                                >
                                  <Microscope size={16} />
                                  <span>Google Schoolar</span>
                                </a>
                              </li>
                            )}
                            {socialLinks.linkedin && (
                              <li>
                                <a
                                  href={socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 hover:underline"
                                >
                                  <Linkedin size={16} />
                                  <span>LinkedIn</span>
                                </a>
                              </li>
                            )}
                          </ul>
                          <button
                            onClick={() => setDialogOpen(false)}
                            className="mt-4 w-full py-2 bg-primary text-white rounded"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
              </>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center text-xs text-primary hover:underline"
              >
                <Mail size={14} className="mr-1" />
                Kontak
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMember;
